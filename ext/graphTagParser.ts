import respParsingUtil from "./respParsingUtil";

export class GraphQLAST {
    name: string;
    alias: string;
    inlineFragment: boolean;
    value: any;
    args: Array<GraphQLAST>;
    fields: Array<GraphQLAST>;
}

export class GraphTagParser {
    private static escapeSeq = {
        "b": "\b",
        "f": "\f",
        "n": "\n",
        "r": "\r",
        "t": "\t",
        "v": "\v",
        "0": "\0",
    };
    private static validNameTerminators =
        [',', ')', '}'];
    private graphql: string;
    private index: number;
    private nextToken: string;

    constructor(graphql) {
        this.graphql = graphql;
        this.index = 0;
    }

    private static isAlphaNum(ascii: number): boolean {
        return (ascii >= 48 && ascii <= 57) || // numeric (0-9)
            (ascii >= 65 && ascii <= 90) || // upper alpha (A-Z)
            (ascii >= 97 && ascii <= 122);
    }
    private static isValidSpecialChar(ascii: number): boolean {
        return (ascii === 45) || (ascii === 95) || (ascii === 46); //  '-' or '_' or '.'
    }

    private static skipWhiteSpacesAndComments(graphql: string, pos: number): number {
        let isComment = false;
        while (pos < graphql.length) {
            const c = graphql.charAt(pos);
            if (isComment) {
                if (c === '\n')
                    isComment = false;
                pos++;
            } else {
                if (c === '#') {
                    isComment = true;
                    pos++;
                } else if (/\s/.test(c))
                    pos++;
                else
                    break;
            }
        }
        return pos;
    }

    private errorObject(nextPos: number, errPrompt: string): any {
        let lineNum = 0, colNum = 0;
        for (let idx = 0; idx < nextPos - 1; idx ++) {
            const c = this.graphql.charAt(idx);
            colNum++;
            if (c === '\n') {
                lineNum++;
                colNum = 0;
            }
        }
        const message =
            `Syntax Error GraphQL request (${lineNum + 1}, ${colNum + 1}) ${errPrompt} "${this.nextToken}"`;

        let details;
        const lines = this.graphql.split('\n');
        if (lineNum != 0)
            details = lineNum + ': ' + lines[lineNum - 1] + '\n';
        const errLine = (lineNum + 1) + ': ' + lines[lineNum];
        const indicatorLine = Array(errLine.length - (lines[lineNum].length - colNum) + 1).join(' ');
        details += errLine + '\n' + indicatorLine + '^';
        if (lineNum < lines.length - 1)
            details += '\n' + (lineNum + 2) + ': ' + lines[lineNum + 1];

        return {
            message: message,
            type: respParsingUtil.RESP_TYPE_ERROR,
            details: details
        }
    }
    /**
     * The lexer to pre-fetch next token without changing index
     * @return {number} next index position
     */
    private getNextToken(): number {
        let token = '';
        let nextPos = GraphTagParser.skipWhiteSpacesAndComments(this.graphql, this.index);

        //  try to parse element label, string, number value etc
        while (nextPos < this.graphql.length) {
            let ascii = this.graphql.charCodeAt(nextPos);
            if (!GraphTagParser.isAlphaNum(ascii) && !GraphTagParser.isValidSpecialChar(ascii))
                break;
            token += this.graphql.charAt(nextPos++);
        }

        //  it's a separator token
        if (nextPos < this.graphql.length && !token)
            token = this.graphql.charAt(nextPos++);

        this.nextToken = token;
        return nextPos;
    }

    /**
     * get next token and move parser index
     * @return {string} token
     */
    private next(): string {
        this.index = this.getNextToken();
        return this.nextToken;
    }

    private isInlineFragment(nextPos: number, ast: GraphQLAST): boolean {
        if (this.nextToken === '...') {
            this.index = nextPos;
            if (this.next() !== 'on') {
                throw this.errorObject(this.index, 'Unexpected');
            }
        } else if (this.nextToken === '...on') {
            this.index = nextPos;
        } else
            return false;

        ast.inlineFragment = true;
        return true;
    }

    private parseName(ast: GraphQLAST, forField: boolean) {
        let nextPos = this.getNextToken();
        if (!this.nextToken)
            throw this.errorObject(nextPos, 'Expected Name, found');

        if (!GraphTagParser.isAlphaNum(this.nextToken.charCodeAt(0))) {
            //  if it's a field name it might be inline fragment (... on)
            if (!forField || !this.isInlineFragment(nextPos, ast)) {
                if (GraphTagParser.validNameTerminators.indexOf(this.nextToken) < 0)
                    throw this.errorObject(nextPos, 'Unexpected');
                else
                    return;
            }
        }
        if (ast.inlineFragment) {
            //  get next token as real name
            nextPos = this.getNextToken();
            if (!GraphTagParser.isAlphaNum(this.nextToken.charCodeAt(0))) {
                //  check the token after inline fragment, if it's not valid name..
                throw this.errorObject(nextPos, 'Unexpected');
            }
        }

        this.index = nextPos;
        const text = this.nextToken;
        nextPos = this.getNextToken();
        if (this.nextToken === ':') {
            if (ast.inlineFragment)
                throw this.errorObject(nextPos, 'Unexpected');
            else if (forField) {
                //  the current token is an alias
                this.index = nextPos;
                ast.alias = text;
                nextPos = this.getNextToken();
                if (!GraphTagParser.isAlphaNum(this.nextToken.charCodeAt(0))) {
                    //  check the token after alias, if it's not valid name..
                    throw this.errorObject(nextPos, 'Unexpected');
                }
                ast.name = this.nextToken;
                this.index = nextPos;
            } else {
                ast.name = text;
            }
        } else
            ast.name = text;
    }

    private parseStringValue(): string {
        let str = '';
        while (this.index < this.graphql.length) {
            //  from ascii of '\SPACE' to '~'
            let ascii = this.graphql.charCodeAt(this.index);
            if (ascii === 92) {
                //  backspace escape
                this.index++;
                ascii = this.graphql.charCodeAt(this.index);
                //  all chars from '\SPACE' to '~' are available, including '"'
                if (ascii >= 32 && ascii <= 126) {
                    const char = this.graphql.charAt(this.index++);
                    if (GraphTagParser.escapeSeq.hasOwnProperty(char))
                        str += GraphTagParser.escapeSeq[char];
                    else
                        str += char;
                } else
                    break;
            } else if (ascii >= 32 && ascii <= 126 && ascii != 34) {
                //  all chars from '\SPACE' to '~' are available, except '"'
                str += this.graphql.charAt(this.index++);
            } else
                break;
        }
        // console.log('string value: ' + str)
        return str;
    }

    private parseValue(ast: GraphQLAST) {
        let token = this.next();
        // console.log('parse value! token: ' + token)
        if (token === '{') {
            //  complicate value like INPUT_OBJECT
            ast.value = {};
            while (this.index < this.graphql.length) {
                const propAst = new GraphQLAST();
                this.parseName(propAst, false);
                if (propAst.name) {
                    if (this.next() !== ':')
                        throw this.errorObject(this.index, 'Expected ":", found');
                    this.parseValue(propAst);

                    //  here the property AST won't have alias
                    ast.value[propAst.name] = propAst;
                }
                //  the separator here could also be whitespace
                const nextPos = this.getNextToken();
                if (this.nextToken === ',')
                    this.index = nextPos;
                else if (this.nextToken === '}' || this.nextToken === ')')
                    break;
            }
            if (this.next() !== '}')
                throw this.errorObject(this.index, 'Expected "}", found');
        } else if (token === '"') {
            //  string value
            ast.value = this.parseStringValue();
            if (this.next() !== '"')
                throw this.errorObject(this.index, 'Expected """, found');
        } else if (token === '[') {
            ast.value = [];
            while (this.index < this.graphql.length) {
                //  here we need to eat extra ','
                let nextPos = this.getNextToken();
                while (this.index < this.graphql.length) {
                    if (this.nextToken === ',') {
                        this.index = nextPos;
                        nextPos = this.getNextToken();
                    } else
                        break;
                }

                //  if it's an empty array then here might be ']'...
                if (this.nextToken === ']')
                    break;

                const itemAst = new GraphQLAST();
                this.parseValue(itemAst);
                if (itemAst.value || itemAst.value === 0 || itemAst.value === false)
                    ast.value.push(itemAst);
            }
            if (this.next() !== ']')
                throw this.errorObject(this.index, 'Expected "]", found');
        } else if (token === '$') {
            //  variable
            token = this.next();
            if (GraphTagParser.isAlphaNum(token.charCodeAt(0)) ||
                GraphTagParser.isValidSpecialChar(token.charCodeAt(0)))
                ast.value = '$' + token;
            else
                throw this.errorObject(this.index, 'Expected Name, found');
        } else if (token.toLowerCase() === 'true')
            ast.value = true;
        else if (token.toLowerCase() === 'false')
            ast.value = false;
        else if (!isNaN(parseFloat(token)))
            //  number
            ast.value = parseFloat(token);
        else if (GraphTagParser.isAlphaNum(token.charCodeAt(0)))
            //  enum value - save as string
            ast.value = token;
        else
            throw this.errorObject(this.index, 'Unexpected');
    }

    private parseArgs(ast: GraphQLAST) {
        let nextPos = this.getNextToken();
        if (this.nextToken !== '(') {
            //  no args
            return;
        }

        this.index = nextPos;
        ast.args = [];
        while (this.index < this.graphql.length) {
            const optAst = new GraphQLAST();
            this.parseName(optAst, false);
            if (optAst.name) {
                if (this.next() !== ':')
                    throw this.errorObject(this.index, 'Expected ":", found');
                this.parseValue(optAst);
                ast.args.push(optAst);
            }

            // console.log('current args: ' + JSON.stringify(ast.args))
            nextPos = this.getNextToken();
            if (this.nextToken === ",")
                this.index = nextPos;
            else if (this.nextToken === ')')
                break;
        }
        if (this.next() !== ')')
            throw this.errorObject(this.index, 'Expected ")", found');
    }

    private parseFields(ast) {
        let nextPos = this.getNextToken();
        if (this.nextToken !== '{') {
            //  no fields
            return;
        }

        this.index = nextPos;
        ast.fields = [];
        while (this.index < this.graphql.length) {
            const subAst = new GraphQLAST();
            this.parseName(subAst, true);
            if (subAst.name) {
                this.parseArgs(subAst);
                this.parseFields(subAst);
                ast.fields.push(subAst);
            }

            nextPos = this.getNextToken();
            if (this.nextToken === ",")
                this.index = nextPos;
            else if (this.nextToken === '}')
                break;
        }
        if (this.next() !== '}')
            throw this.errorObject(this.index, 'Expected "}", found');
    }

    parseGraph(ast: GraphQLAST): GraphQLAST {
        this.parseName(ast, true);
        this.parseArgs(ast);
        this.parseFields(ast);

        this.index = GraphTagParser.skipWhiteSpacesAndComments(this.graphql, this.index);
        if (this.index !== this.graphql.length)
            throw this.errorObject(this.index, 'Unexpected');

        return ast;
    }
}
