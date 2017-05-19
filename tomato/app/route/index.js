'use strict';
var Router = require('koa-router');
var router = new Router();
var path = require('path');
var send = require('koa-send');
var conf = require('../../config/env');
var Demo = require('./Demo');
var User = require('./User');

const rootPath = path.join(conf.rootdir, conf.dist);
const defaultPage = conf.defaultPage;

/**
 * 显示框架页面 - index.html
 * （PS：配置koa-connect-api-fallback中间件后，此路由失效）
 */
router.get(['/', '/index'], async (ctx, next)=> {
  await send(ctx, defaultPage, {root: rootPath});
});

// 路由配置 - User
router.use('/user', User.routes(), User.allowedMethods());

// 路由配置 - Demo
router.use('/demo', Demo.routes(), Demo.allowedMethods());

module.exports = router;
