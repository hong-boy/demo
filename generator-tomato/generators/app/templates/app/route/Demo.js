'use strict';
var router = require('koa-router')({});

router.get('/', (ctx, next)=> {
    ctx.body = 'Demo page';
});

module.exports = router;
