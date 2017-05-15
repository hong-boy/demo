'use strict';
let path = require('path');
let rootdir = path.resolve(__dirname, '../../'); // 工程根路径
const conf = {
    project: '/',
    port: 3000,
    rootdir: rootdir,
    env: process.env.NODE_ENV || 'develpoment',
    dist: 'dist', // webpack打包输出路径
    log4js: {
        level: 'debug',
        output: path.join(rootdir, 'logs/app.log'),
    },
    webservice: {
        url: 'http://localhost:8001',
        ver: '/web',
        connectTimeout: false,
        requestTimeout: false
    },
    session: {// TODO - koa-session2

    },
    storage: {// session、项目中的常量等需要使用第三方存储（redis）

    }
};

module.exports = conf;