<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // 应用启动时初始化认证状态
  authStore.initAuth()
})
</script>

<template>
  <router-view />
</template>

<style scoped></style>
