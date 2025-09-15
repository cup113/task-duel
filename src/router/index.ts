import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue'),
    },
    {
      path: '/room/:id',
      name: 'room',
      component: () => import('@/views/RoomView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/room/:id/task/:taskId',
      name: 'task',
      redirect: (to) => {
        // 向后兼容：将旧的任务URL重定向到房间页面
        return { path: `/room/${to.params.id}` }
      },
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'auth' })
    return
  }

  // 检查是否需要游客状态（未认证）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
