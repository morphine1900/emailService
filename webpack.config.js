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
        loaders: [
            {
                test: path.join(__dirname, '.'),
                exclude: /(node_modules)/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};