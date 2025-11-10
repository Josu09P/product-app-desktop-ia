import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/presentation/views/HomeView.vue'
import AuthLoginPage from '@/presentation/security/auth/LoginPage.vue'
import RegisterPage from '@/presentation/security/auth/RegisterPage.vue'
import SentimientosView from '@/presentation/views/SentimientosView.vue'
import RLMultipleView from '@/presentation/views/RLMultipleView.vue'
import ClustersView from '@/presentation/views/ClustersView.vue'
import RLSimpleView from '@/presentation/views/RLSimpleView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    keepAlive?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth/login',
    },
    {
      path: '/auth',
      children: [
        {
          path: 'login',
          name: 'login',
          component: AuthLoginPage,
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterPage,
        },
      ],
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/sentimientos',
      name: 'sentimientos',
      component: SentimientosView,
      meta: { keepAlive: true },
    },
    {
      path: '/rl-multiple',
      name: 'rl-multiple',
      component: RLMultipleView,
      meta: { keepAlive: true },
    },
    {
      path: '/rl-simple',
      name: 'rl-simple',
      component: RLSimpleView,
      meta: { keepAlive: true },
    },
    {
      path: '/clusters',
      name: 'clusters',
      component: ClustersView,
    },
    // 🚫 Manejo de rutas no encontradas
    {
      path: '/:pathMatch(.*)*',
      redirect: '/auth/login',
    },
  ],
})

export default router
