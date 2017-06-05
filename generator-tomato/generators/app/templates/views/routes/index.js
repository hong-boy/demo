'use strict';
import VueRouter from 'vue-router'
import NotFoundPage from '../components/common/404.vue'
import LoginPage from '../components/login_page/login.vue'
import HomePage from '../components/home_page/home_page.vue'
import MainPage from '../components/main_page/main_page.vue'

const routes = [];

let homeRouter = {path: '\/(index)?', component: HomePage, children: []};
const children = homeRouter.children;

routes.push({path: '/login', component: LoginPage});
routes.push({
    path: '/logout',
    component: LoginPage,
    beforeEnter: async (to, from, next)=> {
        await IOT.signout();
        next('/login');
    }
});
routes.push(homeRouter);
children.push({path: '/', component: MainPage});
routes.push({path: '/404', component: NotFoundPage});
routes.push({path: '*', redirect: '/404'});

export default new VueRouter({
    mode: 'history', // 使用H5 history，需要配合router-link标签
    routes: routes
});

