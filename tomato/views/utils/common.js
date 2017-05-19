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
 * 加载session对象
 */
let loadSession = function () {
  return JSON.parse(window.sessionStorage.getItem('session') || null);
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
  let session = loadSession(),
    pages = session.pages || {},
    fulls = pages.full,
    fuzzys = pages.fuzzy;
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

export default {
  fetch,
  loadSession,
  restoreSession,
  removeSession,
  auth,
  redirect2Home,
}
