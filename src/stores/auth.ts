import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // 从localStorage初始化用户状态（手动调用）
  const initAuth = () => {
    const savedUser = localStorage.getItem('task-duel-user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    }
  }

  // 设置用户信息
  const setUser = (userData: User) => {
    user.value = userData
    isAuthenticated.value = true
    localStorage.setItem('task-duel-user', JSON.stringify(userData))
  }

  // 清除用户信息
  const clearUser = () => {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('task-duel-user')
  }

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    initAuth,
    setUser,
    clearUser,
    setLoading,
  }
})
