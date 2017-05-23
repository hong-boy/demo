let deepMerge = require('lodash/defaultsDeep');
let base = require('./base.conf');
/**
 * 用于生产环境
 */
module.exports = deepMerge({
  debug: true,
  port: 3002,
  env: 'production',
  dist: 'dist/prod',
  log4js: {
    level: 'error'
  }
}, base);
