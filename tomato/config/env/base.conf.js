'use strict';
let path = require('path');
let rootdir = path.resolve(__dirname, '../../'); // 工程根路径
const project = '/koa2';
const conf = {
  project: project,
  port: 3000,
  rootdir: rootdir,
  debug: false, // true-开发模式 false-生产环境
  env: process.env.NODE_ENV || 'develpoment',
  dist: 'dist', // webpack打包输出路径
  defaultPage: 'index.html',
  allowedFileExtension: ['.js', '.css', '.html', '.ttf', '.woff'], // 定义允许下载的文件类型
  log4js: {
    level: 'debug',
    output: path.join(rootdir, 'logs/app.log')
  },
  webservice: {
    url: 'http://localhost:8001',
    ver: '/web',
    connectTimeout: false,
    requestTimeout: false
  },
  session: {
    key: 'sid',
    store: null, // Session第三方存储
    maxAge: 3600 * 1000, // 60mins
    httpOnly: true,
    path: project
  },
  redis: { // 通常一个项目只需配置一台redis服务器即可
    host: '127.0.0.1',
    port: 6379,
    db: 15
  },
  store: null // 定义将项目中的常量存储于何处。null:NodeJS内存（默认） redis:Redis服务器
};

module.exports = conf;
