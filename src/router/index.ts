import { createRouter, createWebHashHistory } from 'vue-router'
// console.log(VueRouter, '---vue router')
let routes = [
    {
        path: '/',
        name: 'home',
        redirect: '/home',
    },
    {
        path: '/home',
        name: 'layout',
        component: () => import(/* webpackChunkName: "home" */ '../views/layout/index.vue'),
        children: [
            {
                path: '/home/index',
                name: 'index',
                component: () => import(/* webpackChunkName: "home" */ '../views/Home/index.vue')
            },
            {
                path: '/home/about',
                name: 'about',
                component: () => import(/* webpackChunkName: "home" */ '../views/About/index.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;