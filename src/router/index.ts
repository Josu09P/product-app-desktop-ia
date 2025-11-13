import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/presentation/views/HomeView.vue'
import AuthLoginPage from '@/presentation/security/auth/LoginPage.vue'
import RegisterPage from '@/presentation/security/auth/RegisterPage.vue'
import SentimientosView from '@/presentation/views/SentimientosView.vue'
import RLMultipleView from '@/presentation/views/RLMultipleView.vue'
import ClustersView from '@/presentation/views/ClustersView.vue'
import RLSimpleView from '@/presentation/views/RLSimpleView.vue'
import DocumentationView from '@/presentation/views/DocumentationView.vue'
import { AuthHelper } from '@/utils/authHelper'

declare module 'vue-router' {
  interface RouteMeta {
    keepAlive?: boolean
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/auth',
      children: [
        {
          path: 'login',
          name: 'login',
          component: AuthLoginPage,
          meta: { guestOnly: true }
        },
        {
          path: 'register',
          name: 'register',
          component: RegisterPage,
          meta: { guestOnly: true }
        },
      ],
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/sentimientos',
      name: 'sentimientos',
      component: SentimientosView,
      meta: { keepAlive: true, requiresAuth: true }
    },
    {
      path: '/rl-multiple',
      name: 'rl-multiple',
      component: RLMultipleView,
      meta: { keepAlive: true, requiresAuth: true }
    },
    {
      path: '/rl-simple',
      name: 'rl-simple',
      component: RLSimpleView,
      meta: { keepAlive: true, requiresAuth: true }
    },
    {
      path: '/clusters',
      name: 'clusters',
      component: ClustersView,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home',
    },
    {
      path: '/documentation',
      name: 'documentation',
      component: DocumentationView,
      meta: { requiresAuth: true }
    },
  ],
})

function cleanupCameraOnNavigation() {
  // Limpiar cámara al navegar fuera de las páginas de auth
  const stopAllCameraTracks = () => {
    const videoElements = document.querySelectorAll('video')
    videoElements.forEach(video => {
      if (video.srcObject instanceof MediaStream) {
        video.srcObject.getTracks().forEach(track => track.stop())
        video.srcObject = null
      }
    })
  }

  return stopAllCameraTracks
}

// Usar en el router beforeEach si es necesario
router.beforeEach((to, from, next) => {
  const isAuthenticated = AuthHelper.isAuthenticated()

  // Si salimos de las páginas de auth, limpiar cámara
  if (from.meta.guestOnly && !to.meta.guestOnly) {
    cleanupCameraOnNavigation()
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth/login')
    return
  }

  if (to.meta.guestOnly && isAuthenticated) {
    if (from.name === 'login' || from.name === 'register') {
      window.location.href = '/home'
      return
    }
    next('/home')
    return
  }

  next()
})

export default router
