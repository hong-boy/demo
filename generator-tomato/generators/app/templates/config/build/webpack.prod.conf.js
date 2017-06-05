let webpack = require('webpack');
let merge = require('webpack-merge');
let path = require('path');
let base = require('./webpack.base.conf.js');
let app = require('../env');
let dist = app.dist;
let rootdir = app.rootdir;

module.exports = merge(base, {
    output: {
        path: path.join(rootdir, dist),
        publicPath: '',
        filename: '[name].[hash].js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common",
            filename: "[name].bundle.[hash].js"
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    ]
});
