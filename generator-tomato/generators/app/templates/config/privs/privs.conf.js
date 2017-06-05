'use strict';
/**
 * 系统权限列表
 * @usage
 * {
 *  PRIVS_ID: {
 *    PRIVS_NAME: '',
 *    PRIVS_URLS: [], // 权限URL（即：后端（即：Node端）路由path）注意：后端接受到的GET请求均
 *    //被connect-api-history-fallback拦截，并将此请求转发给vue-router，故后端业务中间件只会接受到POST请求。
 *    FUZZY: false, // 是否对PRIVS_URLS采取模糊匹配，true-是 false-否（默认：false）
 *    CHILDREN: { // 子权限，例如：子权限A和子权限B都是权限C的子权限，则能够访问子权限A或者B的前提条件是：先拥有权限C
 *      // ...
 *    }
 *  }
 * }
 */
module.exports = {
    '01': {
        name: '首页',
        urls: '/index'
    },
    '02': {
        name: '用户管理',
        urls: '/userManage',
        children: {
            '0201': {
                name: '用户列表',
                urls: '/userManage/list',
                fuzzy: true
            },
            '0202': {
                name: '用户详情',
                urls: '/userManage/details'
            },
            '0203': {
                name: '用户添加|编辑|删除',
                urls: '/userManage/operate',
                fuzzy: true
            },
        }
    }
};
