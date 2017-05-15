'use strict';
import VueRouter from 'vue-router'
import NotFoundPage from '../components/common/404.vue'
import LoginPage from '../components/login_page/login.vue'

const routes = [];

routes.push({path: '/login', component: LoginPage});
routes.push({path: '/404', component: NotFoundPage});

export default new VueRouter({
    mode: 'history', // 使用H5 history，需要配合router-link标签
    routes: routes
});

