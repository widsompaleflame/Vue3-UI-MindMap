import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue'; //首页的vue组件
import EditorView from "../views/EditorView.vue"; //新建vue的组件

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/editor',
            name: 'editor',
            component: EditorView
        }
    ]
});

export default router;