'use strict';
var conf = require('../../config/env');

const LOGIN_SUCC_URL = [conf.project, '/'].join('');

/**
 * 用户登录
 */
exports.signin = async function (ctx, next) {
  ctx.body = {userid: 'test', username: 'juve'};
};

/**
 * 用户登出
 */
exports.signout = async function (ctx, next) {
  ctx.body = "登出成功！";
};
