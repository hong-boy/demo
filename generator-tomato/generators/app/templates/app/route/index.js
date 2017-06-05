'use strict';
var Router = require('koa-router');
var router = new Router();
var path = require('path');
var send = require('koa-send');
var conf = require('../../config/env');
var Demo = require('./Demo');
var User = require('./User');
var UserCtrl = require('../controller/UserController');
var canAccessPath = require('../Auth.js').canAccessPath;
var ResponseBean = require('../bean/ResponseBean');

const rootPath = path.join(conf.rootdir, conf.dist);
const defaultPage = conf.defaultPage;

/**
 * 显示框架页面 - index.html
 * （PS：配置koa-connect-api-fallback中间件后，此路由失效）
 */
router.get(['/', '/index'], async (ctx, next)=> {
    await send(ctx, defaultPage, {root: rootPath});
});

router.post('/auth', async (ctx, next)=> {
    let path = ctx.request.body.path;
    let isLogin = false;
    let isAuth = false;
    let bean = new ResponseBean();
    ctx.assert(path, 400, `参数path缺失！[${path}]`);
    if (ctx.isUnauthenticated()) {
        bean.status = ResponseBean.STATUS.ERROR;
        bean.msg = '没有登录';
    } else if (!canAccessPath(ctx, path)) {
        bean.status = ResponseBean.STATUS.ERROR;
        bean.msg = '没有访问权限';
    } else {
        isLogin = true;
        isAuth = true;
    }
    bean.data = {isAuth: isAuth, isLogin: isLogin};
    ctx.body = bean;
});

router.post('/login', UserCtrl.signin);
router.post('/logout', UserCtrl.signout);

// 路由配置 - User
router.use('/user', User.routes(), User.allowedMethods());

// 路由配置 - Demo
router.use('/demo', Demo.routes(), Demo.allowedMethods());

module.exports = router;
