'use strict';
const passport = require('koa-passport');
const lodash = require('lodash/object');
const conf = require('../privs.js');

/**
 * 根据用户角色ID获取用户权限
 * TODO 将用户角色缓存到第三方存储
 * @param roleId
 * @returns {{fuzzy: Array, full: Array}}
 */
function processPrivsUrl(roleId) {
  let result = {fuzzy: [], full: []},
    privsList = conf.roles[roleId].privs,
    cFull = conf.privs.full,
    cFuzzy = conf.privs.fuzzy;

  privsList.forEach(pid=> {
    if (cFull[pid]) {
      result.full.push(cFull[pid]);
    } else if (cFuzzy[pid]) {
      result.fuzzy.push(cFuzzy[pid]);
    } else {
      // do nothing
    }
  });

  return result;
}

/**
 * 获取用户信息
 * @param username
 * @param password
 * @returns {Promise}
 */
function fetchUser(username, password) {
  let fakeUser = {"username": "admin", "password": "21232f297a57a5a743894a0e4a801fc3", "roleId": 1};
  let promise = new Promise((resolve)=> {
    let result = null;
    if (username === fakeUser.username && password === fakeUser.password) {
      result = fakeUser;
      let privs = processPrivsUrl(result.roleId);
      result = lodash.assign(result, privs);
      console.log(result);
    }
    resolve(result);
  });
  return promise;
}

/**
 * Registers a function used to serialize user objects into the session.
 */
passport.serializeUser(function (user, done) {
  done(null, user)
});

/**
 * Registers a function used to deserialize user objects out of the session.
 */
passport.deserializeUser(function (user, done) {
  done(null, user)
});

/**
 * 本地
 * @type {Strategy}
 */
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
  async function (req, username, password, done) {
    let user = await fetchUser(username, password);
    if (user) {
      done(undefined, user);
    } else {
      done('用户名或密码错误！', undefined);
    }
  }));
