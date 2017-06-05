'use strict';
var passport = require('koa-passport');
var logger = require('../util/Logger').logger('UserController');
var ResponseBean = require('../bean/ResponseBean');

/**
 * 用户登录
 */
exports.signin = async function (ctx, next) {
    let callback = function (err, result) {
        let bean = new ResponseBean();
        // 若验证失败
        if (err) {
            bean.status = ResponseBean.STATUS.ERROR;
            bean.msg = err;
            logger.error('Sign in failed!', err);
            ctx.body = bean;
            return;
        }
        // 将User存储到Session
        ctx.login(result, (err) => {
            if (err) {
                logger.error('Serialize user into Session failed!', err);
                bean.status = ResponseBean.STATUS.ERROR;
                bean.msg = err;
            }
            ctx.body = bean;
        });
    };
    passport.authenticate('local', callback)(ctx, next);
};

/**
 * 用户登出
 */
exports.signout = async function (ctx, next) {
    ctx.logout();
    ctx.body = new ResponseBean(ResponseBean.STATUS, '登出成功');
};

/**
 * 用户列表
 */
exports.list = async function (ctx, next) {
    ctx.body = new ResponseBean(200, "成功获取用户列表信息！", [{user: 'aa'}]);
};
