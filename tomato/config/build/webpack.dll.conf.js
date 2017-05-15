'use strict';

var path = require("path");
var webpack = require("webpack");
let app = require('../env');
let rootdir = path.resolve(__dirname, '../../');
let dllPath = path.join(rootdir, app.dist, "dll");

module.exports = {
    entry: {
        vendor: ['vue', 'vue-router', 'lodash', 'element-ui']
    },
    output: {
        path: dllPath,
        filename: "dll.[name].js",
        library: "[name]"
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(dllPath, "[name]-manifest.json"),
            name: "[name]",
            context: rootdir
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ]
};