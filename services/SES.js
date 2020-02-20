const AWS = require('aws-sdk');
const config = require('config');

class SES {
    constructor() {
        AWS.config.update({
            accessKeyId: config.get('SES').get('accessKeyId'),
            secretAccessKey: config.get('SES').get('secretAccessKey'),
            region: config.get('SES').get('region')
        });
        this.name = "SES";
        this.ses = new AWS.SES();
    }

    send(emailDTO) {
        const params = {
            Destination: {
                ToAddresses: [emailDTO.to]
            },
            Message: {
                Body: {
                    Text: {
                        Charset: 'UTF-8',
                        Data: "from ses"//emailDTO.content
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: emailDTO.subject
                }
            },
            ReturnPath: emailDTO.from,
            Source: emailDTO.from,
        };

        return new Promise((resolve, reject) => {
            this.ses.sendEmail(params, (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        })
    }
}

module.exports = SES;