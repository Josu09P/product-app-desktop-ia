import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/presentation/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/auth',
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/presentation/views/auth/LoginPage.vue'),
        },
      ],
    },
  ],
})

export default router
