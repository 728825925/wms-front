// router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useAuthStore } from '@/stores/auth'

export const constantRoutes = [
  {
    path: '/',
    name: 'app',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: []
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  }
  // 其他不需要动态加载的路由...
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
})

// 👇 添加路由日志
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const menuStore = useMenuStore()

  if (!authStore.token && to.path !== '/login') {
    menuStore.$reset()
    return next('/login')
  }

  if (to.path === '/login' && authStore.token) {
    return next('/home')
  }

  if (authStore.token && !menuStore.isMenuLoaded) {
    try {
      await menuStore.initDynamicRoutes()
      return next({ ...to, replace: true })
    } catch (err) {
      console.error(err)
      authStore.$reset()
      menuStore.$reset()
      return next('/login')
    }
  }
  next()
})


export default router