const Koa = require('koa');
const app = new Koa();
const json = require('koa-json');
const session = require('koa-session2');
const passport = require('koa-passport');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const bunyan = require('koa-bunyan-logger');
const path = require('path');
const fs = require('mz/fs');
const send = require('koa-send');
const lodash = require('lodash/object');
const historyFallback = require('koa2-history-api-fallback');

const conf = require('./config/env');
const auth = require('./app/Auth.js');
require('./config/passport/strgy.js');
const proxy = require('koa-router')();
const router = require('./app/route/index');
const logger = require('./app/util/Logger').logger('app.js');
const staticPath = path.join(__dirname, conf.dist);

// 日志 - 记录浏览器端上传的请求
async function _logger4req(ctx, next) {
    let req = ctx.request,
        path = req.originalUrl,
        method = ctx.method,
        params = req.body,
        sTime = Date.now();
    logger.debug(`Got request [${method} - ${path}]. Params: ${JSON.stringify(params)}`);
    await next();
    let statusCode = ctx.status;
    logger.info(`Response for [${method} - ${statusCode} - ${path}]. It takes ${Date.now() - sTime}ms.`);
}
/**
 *  为session指定SessionStore
 * @param session
 */
function _initSession(session) {
    let SessionStore = session.store;
    if (SessionStore) {
        session.store = new SessionStore();
    }
    return session;
}

// error handler
onerror(app);

// connect-history-api-fallback(此插件会拦截所有GET|HEAD请求)
app.use(historyFallback({
    index: ['/', conf.defaultPage].join(''),
    verbose: conf.debug
}));

// static serve（因为项目中需要添加逻辑路径，即：conf.project，且ctx.path属于只读权限，故暂且自己实现静态资源服务）
app.use(async (ctx, next)=> {
    let cpath = ctx.path;
    let matches = cpath.match(/\.+\w+$/);
    if (!!matches && conf.allowedFileExtension.indexOf(matches[0]) !== -1) {
        cpath = cpath.replace(conf.project, '');
        let flag = await fs.exists(path.join(staticPath, cpath));
        if (flag) {
            // 生产环境会使用webpack打包，自动为静态资源添加md5前缀，故无需担心静态资源缓存问题
            await send(ctx, cpath, {
                maxage: conf.debug ? 0 : 604800000,
                immutable: !conf.debug,
                root: staticPath
            });
            return;
        }
    }
    await next();
});

// middlewares
app.use(proxy.routes(), proxy.allowedMethods());

proxy.use(
    conf.project,
    session(_initSession(conf.session)),
    bodyparser,
    passport.initialize({userProperty: 'user'}),
    passport.session(),
    auth,
    json(),
    _logger4req,
    router.routes(),
    router.allowedMethods()
);

module.exports = app;
