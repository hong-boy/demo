import {fetch} from './fetch'
import lodash from 'lodash'

/**
 * 加载session对象
 */
let loadSession = function () {
    return JSON.parse(window.sessionStorage.getItem('session') || null);
};

/**
 * 存储session对象
 * @param session
 * @returns {boolean}
 */
let restoreSession = function (session) {
    let result = false;
    try {
        window.sessionStorage.setItem('session', JSON.stringify(session));
        result = true;
    } catch (e) {
        console.error(e);
    }
    return result;
};

/**
 * 移除session
 */
let removeSession = function () {
    window.sessionStorage.removeItem('session');
};

/**
 * 校验页面访问权限
 * @param path
 * @param session
 */
let chkAuthority = function (path) {
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
let gotoHomepage = function () {
    location.href = 'index';
};

export default {
    fetch,
    loadSession,
    restoreSession,
    removeSession,
    chkAuthority,
    gotoHomepage,
}
