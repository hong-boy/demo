'use strict';
let deepMerge = require('lodash/defaultsDeep');
let base = require('./base.conf');
/**
 * 用于开发环境
 */
module.exports = deepMerge({
    port: 3000,
    env: 'development',
    dist: 'dist/dev',
    log4js: {
        level: 'debug'
    }
}, base);