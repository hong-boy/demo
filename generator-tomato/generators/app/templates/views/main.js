'use strict';
import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import router from './routes'
import LayoutView from './layout.vue'
// 全局引入
import IOT from './utils/common.js'
import 'element-ui/lib/theme-default/index.css'
import './assets/less/common.less'

Vue.use(VueRouter);
Vue.use(ElementUI);

window.IOT = IOT;

//router.beforeEach((to, from, next) => {
//  let path = to.path;
//  if (path === '/login' || path === '/404') {
//    // 白名单
//    next();
//  } else if (path === '/logout') {
//    // 若为登出
//    IOT.removeUserInfo();
//    next();
//  } else if (IOT.auth(path)) {
//    // 若用户已登录，且有权限访问path
//    next();
//  } else if (IOT.loadUserInfo()) {
//    // 若用户已登录，则表明没有权限访问path
//    console.error('没有权限!', path);
//    next(false);
//  } else {
//    // 用户没有登录
//    next('/login');
//  }
//});

router.beforeEach(async (to, from, next) => {
    // 校验页面访问权限
    let path = to.path;
    // 若为白名单
    if (path === '/404' || path === '/login') {
        return next();
    }
    // 向后端验证访问权限
    let result = await IOT.auth(path);
    if (!result.isLogin) {
        next('/login');
    } else if (!result.isAuth) {
        console.error(`没有访问权限 - [${path}]`);
        next('/404');
    } else {
        next();
    }
});

new Vue({
    el: '#layout',
    router: router,
    render: function (create) {
        return create(LayoutView);
    }
});
