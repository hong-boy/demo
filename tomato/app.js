const Koa = require('koa');
const app = new Koa();
//const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const bunyan = require('koa-bunyan-logger');
const path = require('path');
const fs = require('mz/fs');
const send = require('koa-send');
const historyFallback = require('koa2-history-api-fallback');

const conf = require('./config/env');
const proxy = require('koa-router')();
const router = require('./app/route');
const staticPath = path.join(__dirname, conf.dist);

// error handler
onerror(app);

// logger - bunyan
//app.use(bunyan());

// connect-history-api-fallback
//此插件会拦截所有GET|HEAD请求
app.use(historyFallback({index: ['/', conf.defaultPage].join(''), verbose: true}));

// static serve
app.use(async (ctx, next)=> {
  let cpath = ctx.path;
  let matches = cpath.match(/\.+\w+$/);
  if(!!matches && conf.allowedFileExtension.indexOf(matches[0]) !== -1){
    cpath = cpath.replace(conf.project, '');
    let flag = await fs.exists(path.join(staticPath, cpath));
    if(flag){
      // 生产环境会使用webpack打包，自动为静态资源添加md5前缀，故无需担心静态资源缓存问题
      //await send(ctx, cpath, {maxage:604800000, immutable:true, root: staticPath});
      await send(ctx, cpath, {maxage: 0, immutable: false, root: staticPath});
    }else {
      await next();
    }
  }else {
    await next();
  }
});

// middlewares
app.use(proxy.routes(), proxy.allowedMethods());
proxy.use(
    conf.project,
    bodyparser,
    json(),
    router.routes(),
    router.allowedMethods()
);

//app.use(views(__dirname + '/views', {
//  extension: 'ejs'
//}));

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

module.exports = app;
