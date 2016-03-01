var webpack = require('webpack')
var path = require('path')

module.exports = {
    devtool: 'source-map',
    entry: {
        main: './scripts/ItemMirror.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'item-mirror.min.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            mangle: false,
            minimize: true
        })
    ],
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader'
        }]
    }
};