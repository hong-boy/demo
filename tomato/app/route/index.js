'use strict';
var Router = require('koa-router');
var conf = require('../../config/env');
var Demo = require('./Demo');
var router = new Router();
var path = require('path');
var send = require('koa-send');

const rootPath = path.join(conf.rootdir, conf.dist);
const defaultPage = conf.defaultPage;

/**
 * 显示框架页面 - index.html
 */
router.get('/', async (ctx, next)=> {
  await send(ctx, defaultPage, {root: rootPath});
});

// 路由配置 - Demo页面
router.use('/demo', Demo.routes(), Demo.allowedMethods());

module.exports = router;
