const path = require('path');

module.exports = {
    entry: './views/react/app.jsx',
    devtool: 'sourcemaps',
    // cache: true,
    // debug: true,
    output: {
        path: __dirname,
        filename: './public/built/bundle.js'
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, '.'),
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
};