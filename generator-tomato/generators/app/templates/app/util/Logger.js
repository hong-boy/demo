'use strict';
/**
 * Logger工具类
 * （此类必须是无依赖的）
 * @type {exports|module.exports}
 */
const log4js = require('log4js'),
    conf = require('../../config/env').log4js,
    output = conf.output,
    level = conf.level;

log4js.configure({
    replaceConsole: true,
    appenders: [
        {type: 'console'},
        {
            type: 'file',
            filename: output,
            maxLogSize: 10240,
            catagory: 'normal'
        }
    ]
});

exports.logger = function (name) {
    var logger = log4js.getLogger(name);
    logger.setLevel(level || 'debug');
    return logger;
};
