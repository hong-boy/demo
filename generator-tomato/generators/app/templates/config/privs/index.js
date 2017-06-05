var roles = require('./roles.conf'),
    privs = require('./privs.conf'),
    _ = require('lodash/collection'),
    fuzzy = {}, //模糊匹配
    full = {}; //全匹配

/**
 * 系统权限索引页
 */
const WHITE_LIST = [
    '/auth',
    '/login',
    '/logout',
];

// 组装权限
(function (privs, full, fuzzy) {
    var callee = arguments.callee;
    _.each(privs, function (bean, key) {
        if (bean.fuzzy) {//模糊匹配
            fuzzy[key] = bean.urls;
        } else {//全匹配
            full[key] = bean.urls;
            callee(bean.children || {}, full, fuzzy);
        }
    });
})(privs, full, fuzzy);

module.exports = {
    whiteList: WHITE_LIST,
    roles: roles,
    privs: {
        fuzzy: fuzzy,
        full: full
    }
};
