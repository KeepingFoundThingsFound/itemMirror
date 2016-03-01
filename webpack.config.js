var webpack = require('webpack'),
path = require('path');

module.exports = {
    debug: true,
    entry: {
        main: './scripts/ItemMirror.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'item-mirror.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader'
        }]
    }
};