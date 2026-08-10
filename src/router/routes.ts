import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'Home',
    },
    component: () => import('../views/home.vue'),
  },
   {
    path: '/about',
    name: 'about',
    meta: {
      title: 'About',
    },
    component: () => import('../views/about.vue'),
  },
   {
    path: '/articles',
    name: 'articles',
    meta: {
      title: 'Articles',
    },
    component: () => import('../views/articles.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    meta: { title: 'Page not found' },
    component: () => import('../views/404.vue'),
  },
]

export default routes
