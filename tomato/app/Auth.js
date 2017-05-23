'use strict';
const WHITE_LIST = require('../config/privs').whiteList;
const project = require('../config/env.js').project;
const REGX_4_PROJECT = new RegExp(`^${project}`, 'i');
const lodash = require('lodash/collection');

/**
 * 清除逻辑路径（conf.project）
 * @param path
 * @returns {void|string|XML|*}
 */
let cleanPath = function (path) {
  return path.replace(REGX_4_PROJECT, '');
};

/**
 * 判断用户是否可以访问当前路由
 * @param ctx
 * @returns {boolean}
 */
let canAccessPath = function (ctx) {
  let flag = true,
    path = cleanPath(ctx.path),
    session = ctx.session || {},
    user = session.passport ? session.passport.user : {},
    privs = user.privs || {},
    full = privs.full || [],
    fuzzy = privs.fuzzy || [];
  //检查是否是白名单项
  flag = lodash.includes(WHITE_LIST, path);
  if (!flag) {
    // 检测是否满足模糊匹配
    flag = lodash.find(fuzzy, (url)=> {
      return path.startsWith(url);
    });
    // 检测是否满足全匹配
    !flag && (flag = lodash.includes(full, path));
  }
  return flag;
};

/**
 *  校验
 *  1. 用户是否已登录
 *  2. 是否可以访问当前路由
 * @param ctx
 * @param next
 */
let auth = async function (ctx, next) {
  if (ctx.isAuthenticated() || canAccessPath(ctx)) {
    await next();
  } else {
    let isXHR = ctx.get('x-requested-with') === 'Fetch';
    if (isXHR) {
      ctx.status = 401;
      ctx.body = '请先登录！';
    } else {
      ctx.redirect(`${project}/login`);
    }
  }
};

module.exports = auth;
