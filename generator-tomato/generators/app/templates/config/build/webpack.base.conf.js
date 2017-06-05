'use strict';
let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let app = require('../env');

const dist = app.dist;
const rootdir = app.rootdir;

const conf = {
    entry: {
        babelMain: 'babel-polyfill',
        main: path.join(rootdir, 'views', 'main.js')
    },
    output: {
        path: path.join(rootdir, dist),
        publicPath: '', // 相对路径 - 相对于index.html页面的base标签
        filename: '[name].[chunkhash].bundle.js',
        chunkFilename: '[name].[chunkhash].chunk.js'
    },
    resolve: {
        extensions: [' ', '.js', '.vue'],
        alias: {
            vue: 'vue/dist/vue.common.js'
        }
    },
    module: {
        rules: [
            {test: /\.vue$/, use: ['vue-loader']},
            {test: /\.js$/, use: ['babel-loader'], exclude: /node_modules/},
            {test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/, use: ['file-loader']},
            {test: /\.(css|less)$/, use: ['style-loader', 'css-loader', 'less-loader']},
            {
                test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
                use: {loader: 'file-loader', options: {name: '[name].[ext]?[hash]'}}
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            project: app.project,
            filename: 'index.html',
            template: path.resolve(rootdir, 'views', 'index.html')
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "common",
            filename: "[name].bundle.js"
        }),
        new webpack.DllReferencePlugin({
            context: rootdir,
            manifest: path.join(rootdir, dist, 'dll', 'vendor-manifest.json')
        })
    ]
};

module.exports = conf;
