'use strict';
import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import router from './routes'
import LayoutView from './layout.vue'
import IOT from './utils/common.js'
import 'element-ui/lib/theme-default/index.css'
import './assets/less/common.less'

Vue.use(VueRouter);
Vue.use(ElementUI);

window.IOT = IOT;

router.beforeEach((to, from, next) => {
  let path = to.path;
  console.log(path, from.path);
  if (path === '/login' || path === '/404') {
    // 白名单
    next();
  } else if (path === '/logout') {
    // 若为登出
    IOT.removeUserInfo();
    next('/login');
  } else if (IOT.auth(path)) {
    // 若用户已登录，且有权限访问path
    next();
  } else if (IOT.loadUserInfo()) {
    // 若用户已登录，则表明没有权限访问path
    console.error('没有权限!', path);
    next(false);
  } else {
    // 用户没有登录
    next('/login');
  }
});

new Vue({
  el: '#layout',
  router: router,
  render: function (create) {
    return create(LayoutView);
  }
});
