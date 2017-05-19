'use strict';
var router = require('koa-router')({});
var UserCtrl = require('../controller/UserController');

router.post('/signin', UserCtrl.signin);

router.post('/signout', UserCtrl.signout);

module.exports = router;
