'use strict';
import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import routes from './routes'
import LayoutView from './layout.vue'

Vue.use(VueRouter);
Vue.use(ElementUI);

routes.beforeEach((to, from, next)=> {
    console.log(to, from);
    next();
});

new Vue({
    el: '#layout',
    router: routes,
    render: (create)=> {
        create(LayoutView);
    }
});