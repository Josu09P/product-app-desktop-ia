import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/presentation/views/HomeView.vue'
import SentimientosView from '@/presentation/views/SentimientosView.vue'

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
          component: () => import('@/presentation/security/auth/LoginPage.vue'),
        },
      ],
    },
    {
      path: '/sentimientos',
      name: 'sentimientos',
      component: SentimientosView,
    },
    {
      path: '/rl-multiple',
      name: 'rl-multiple',
      component: () => import('@/presentation/views/RLMultipleView.vue'),
    },
  ],
})

export default router
