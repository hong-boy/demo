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
 * @param url 路径
 * @returns {boolean}
 */
let canAccessPath = function (ctx, url) {
    let flag = true,
        path = cleanPath(url || ctx.path),
        session = ctx.session || {},
        user = session.passport ? session.passport.user : {},
        full = user.full || [],
        fuzzy = user.fuzzy || [];
    // 检测是否满足模糊匹配
    flag = lodash.find(fuzzy, (url) => {
        return path.startsWith(url);
    });
    // 检测是否满足全匹配
    !flag && (flag = lodash.includes(full, path));
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
    if ((lodash.includes(WHITE_LIST, cleanPath(ctx.path)))
        || (ctx.isAuthenticated() && canAccessPath(ctx))) {
        await next();
        return;
    }
    let isXHR = ctx.get('x-requested-with') === 'Fetch';
    let isUnauth = ctx.isUnauthenticated();
    if (isXHR) {
        ctx.status = isUnauth ? 408 : 401;
        ctx.body = isUnauth ? '请先登录!' : '没有权限!';
    } else {
        ctx.redirect(`${project}${isUnauth ? '/login' : '/404'}`);
    }
};

module.exports = auth;
auth.canAccessPath = canAccessPath;
