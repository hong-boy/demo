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

router.beforeEach((to, from, next)=> {
    console.log(to, from);
    next();
});

new Vue({
  el: '#layout',
  router: router,
  render: function (create) {
    return create(LayoutView);
  }
});
