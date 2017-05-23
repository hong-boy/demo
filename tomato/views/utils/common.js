import {fetch} from './fetch'
import lodash from 'lodash'

const NAMESPACE = 'tomato';

/**
 * 将key用NAMESPACE包装
 * @param key
 * @private
 */
let _getNamespaceKey = function (key) {
  return [NAMESPACE, key].join('-')
};

/**
 * 从sessionStorage获取用户信息
 */
let loadUserInfo = function () {
  return loadSession('userInfo');
};

/**
 * 存储用户信息
 * @param user
 */
let restoreUserInfo = function (user) {
  restoreSession('userInfo', user);
};

/**
 * 移除用户信息
 */
let removeUserInfo = function () {
  removeSession('userInfo');
};

/**
 * 获取sessionstorage中存储的对象
 * @param key
 */
let loadSession = function (key) {
  return JSON.parse(window.sessionStorage.getItem(_getNamespaceKey(key)) || null);
};

/**
 * 向sessionstorage存储对象
 * @param key
 * @param value
 */
let restoreSession = function (key, value) {
  window.sessionStorage.setItem(
    _getNamespaceKey(key),
    lodash.isPlainObject(value) || lodash.isArray(value) ? JSON.stringify(value) : value
  );
};

/**
 * 从sessionstorage移除对象
 * @param key
 */
let removeSession = function (key) {
  window.sessionStorage.removeItem(_getNamespaceKey(key));
};

/**
 * 校验页面访问权限
 * @param path
 * @param session
 */
let auth = function (path) {
  let userInfo = loadUserInfo() || {},
    fulls = userInfo.full || [],
    fuzzys = userInfo.fuzzy || [];
  // check full firstly
  let isFull = lodash.findIndex(fulls, (page)=> page === path) !== -1;
  // check fuzzy
  let isFuzzy = !isFull && lodash.findIndex(fuzzys, (page)=> path.startsWith(page)) !== -1;
  return isFull || isFuzzy;
};

/**
 * 跳转至首页
 */
let redirect2Home = function () {
  location.href = 'index';
};

/**
 * 跳转至404页面
 */
let redirect2NotFound = function () {
  location.href = '404';
};

export default {
  fetch,
  loadUserInfo,
  removeUserInfo,
  restoreUserInfo,
  loadSession,
  restoreSession,
  removeSession,
  auth,
  redirect2Home,
  redirect2NotFound,
}
