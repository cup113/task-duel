<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Task Duel</h2>
        <p class="mt-2 text-center text-sm text-gray-600">实时竞争型任务管理应用</p>
      </div>

      <!-- 登录表单 -->
      <div v-if="activeTab === 'login'" class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">登录 Task Duel</h3>

        <form @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">邮箱</label>
              <input
                id="email"
                v-model="loginForm.email"
                type="email"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入邮箱"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">密码</label>
              <input
                id="password"
                v-model="loginForm.password"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ authStore.isLoading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="mt-4 text-center">
          <button @click="activeTab = 'register'" class="text-sm text-blue-600 hover:text-blue-500">
            没有账号？立即注册
          </button>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-600 text-center mb-3">或者</p>
          <button
            @click="handleGuestLogin"
            :disabled="authStore.isLoading"
            class="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            以游客身份体验
          </button>
          <p class="text-xs text-gray-500 text-center mt-2">
            游客账户将在服务器生成，数据会临时保存
          </p>
        </div>
      </div>

      <!-- 注册表单 -->
      <div v-if="activeTab === 'register'" class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">注册 Task Duel 账户</h3>

        <form @submit.prevent="handleRegister">
          <div class="space-y-4">
            <div>
              <label for="register-name" class="block text-sm font-medium text-gray-700"
                >姓名</label
              >
              <input
                id="register-name"
                v-model="registerForm.name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入姓名"
              />
            </div>

            <div>
              <label for="register-email" class="block text-sm font-medium text-gray-700"
                >邮箱</label
              >
              <input
                id="register-email"
                v-model="registerForm.email"
                type="email"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入邮箱"
              />
            </div>

            <div>
              <label for="register-password" class="block text-sm font-medium text-gray-700"
                >密码</label
              >
              <input
                id="register-password"
                v-model="registerForm.password"
                type="password"
                required
                minlength="6"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入密码（至少6位）"
              />
            </div>

            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700"
                >确认密码</label
              >
              <input
                id="confirm-password"
                v-model="registerForm.confirmPassword"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请再次输入密码"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ authStore.isLoading ? '注册中...' : '注册正式账户' }}
          </button>
        </form>

        <div class="mt-4 text-center">
          <button @click="activeTab = 'login'" class="text-sm text-blue-600 hover:text-blue-500">
            已有账号？立即登录
          </button>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-600 text-center mb-3">或者</p>
          <button
            @click="handleGuestLogin"
            :disabled="authStore.isLoading"
            class="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            创建游客账户体验
          </button>
          <p class="text-xs text-gray-500 text-center mt-2">游客账户将在服务器生成，适合临时体验</p>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'login' | 'register'>('login')
const error = ref('')

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const handleLogin = async () => {
  try {
    error.value = ''
    authStore.setLoading(true)

    const response = await authAPI.login({
      email: loginForm.email,
      password: loginForm.password,
    })

    authStore.setUser(response)
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '登录失败'
  } finally {
    authStore.setLoading(false)
  }
}

const handleRegister = async () => {
  try {
    error.value = ''

    if (registerForm.password !== registerForm.confirmPassword) {
      error.value = '两次输入的密码不一致'
      return
    }

    authStore.setLoading(true)

    const response = await authAPI.register({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
    })

    // 注册成功后自动登录
    const loginResponse = await authAPI.login({
      email: registerForm.email,
      password: registerForm.password,
    })

    authStore.setUser(loginResponse)
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '注册失败'
  } finally {
    authStore.setLoading(false)
  }
}

const handleGuestLogin = async () => {
  try {
    error.value = ''
    authStore.setLoading(true)

    const response = await authAPI.createGuest()

    // 保存游客信息到localStorage
    localStorage.setItem(
      'task-duel-guest',
      JSON.stringify({
        email: response.email,
        password: response.password,
      }),
    )

    authStore.setUser(response)
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '创建游客账户失败'
  } finally {
    authStore.setLoading(false)
  }
}
</script>
