<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 简化导航栏 -->
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex justify-between items-center h-14">
          <div class="flex items-center">
            <h1 class="text-lg font-medium text-gray-900">Task Duel</h1>
          </div>

          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-600 hidden sm:inline"
              >欢迎，{{ authStore.user?.name }}</span
            >
            <button
              @click="handleLogout"
              class="text-sm text-gray-600 hover:text-gray-900 px-2 py-1"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-4 px-4 sm:px-6">
      <div class="py-4">
        <h2 class="text-lg font-medium text-gray-900 mb-4">我的房间</h2>

        <!-- 简化房间列表 -->
        <div v-if="roomStore.userRooms.length > 0" class="space-y-3">
          <div
            v-for="room in roomStore.userRooms"
            :key="room.id"
            class="bg-white p-4 border-b border-gray-100"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="text-md font-medium text-gray-900">{{ room.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">房间码: {{ room.code }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(room.created) }}</p>
              </div>

              <div class="flex space-x-2 ml-4">
                <button
                  @click="enterRoom(room.id)"
                  class="bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700"
                >
                  进入
                </button>
                <button
                  @click="copyRoomCode(room.code)"
                  class="bg-gray-100 text-gray-700 px-3 py-1 text-sm hover:bg-gray-200"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 简化空状态 -->
        <div v-else class="text-center py-8">
          <p class="text-gray-500 mb-4">您还没有加入任何房间</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button @click="createRoom" class="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
              创建房间
            </button>
            <button @click="joinRoom" class="bg-gray-100 text-gray-700 px-4 py-2 hover:bg-gray-200">
              加入房间
            </button>
          </div>
        </div>

        <!-- 简化操作按钮 -->
        <div v-if="roomStore.userRooms.length > 0" class="mt-6 flex flex-col sm:flex-row gap-3">
          <button @click="createRoom" class="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
            创建新房间
          </button>
          <button @click="joinRoom" class="bg-gray-100 text-gray-700 px-4 py-2 hover:bg-gray-200">
            加入房间
          </button>
        </div>
      </div>
    </main>

    <!-- 简化模态框 -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white p-6 w-full max-w-sm">
        <h3 class="text-lg font-medium text-gray-900 mb-4">创建房间</h3>

        <form @submit.prevent="handleCreateRoom">
          <div class="mb-4">
            <label for="room-name" class="block text-sm font-medium text-gray-700 mb-1"
              >房间名称</label
            >
            <input
              id="room-name"
              v-model="newRoomName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="请输入房间名称"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="roomStore.isLoading"
              class="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 简化加入房间模态框 -->
    <div
      v-if="showJoinModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white p-6 w-full max-w-sm">
        <h3 class="text-lg font-medium text-gray-900 mb-4">加入房间</h3>

        <form @submit.prevent="handleJoinRoom">
          <div class="mb-4">
            <label for="room-code" class="block text-sm font-medium text-gray-700 mb-1"
              >房间码</label
            >
            <input
              id="room-code"
              v-model="roomCode"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="请输入房间码"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showJoinModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="roomStore.isLoading"
              class="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              加入
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useRoomStore } from '@/stores'
import { roomAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const roomStore = useRoomStore()

const showCreateModal = ref(false)
const showJoinModal = ref(false)
const newRoomName = ref('')
const roomCode = ref('')

// 加载用户房间
const loadUserRooms = async () => {
  try {
    roomStore.setLoading(true)
    const rooms = await roomAPI.getUserRooms(authStore.user!.id)
    roomStore.setUserRooms(rooms)
  } catch (error) {
    console.error('加载房间失败:', error)
  } finally {
    roomStore.setLoading(false)
  }
}

// 创建房间
const createRoom = () => {
  showCreateModal.value = true
  newRoomName.value = ''
}

const handleCreateRoom = async () => {
  try {
    roomStore.setLoading(true)

    const room = await roomAPI.createRoom({
      name: newRoomName.value,
      ownerId: authStore.user!.id,
    })

    // 重新加载房间列表
    await loadUserRooms()
    showCreateModal.value = false

    // 进入新创建的房间
    enterRoom(room.id)
  } catch (error) {
    console.error('创建房间失败:', error)
    alert('创建房间失败，请重试')
  } finally {
    roomStore.setLoading(false)
  }
}

// 加入房间
const joinRoom = () => {
  showJoinModal.value = true
  roomCode.value = ''
}

const handleJoinRoom = async () => {
  try {
    roomStore.setLoading(true)

    const room = await roomAPI.getRoomByCode(roomCode.value)

    // 添加用户到房间
    await roomAPI.addUserToRoom(room.id, authStore.user!.id)

    // 重新加载房间列表
    await loadUserRooms()
    showJoinModal.value = false

    // 进入房间
    enterRoom(room.id)
  } catch (error) {
    console.error('加入房间失败:', error)
    alert('加入房间失败，请检查房间码是否正确')
  } finally {
    roomStore.setLoading(false)
  }
}

// 进入房间
const enterRoom = (roomId: string) => {
  router.push(`/room/${roomId}`)
}

// 复制房间码
const copyRoomCode = (code: string) => {
  navigator.clipboard.writeText(code)
  alert('房间码已复制到剪贴板')
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 退出登录
const handleLogout = () => {
  authStore.clearUser()
  router.push('/auth')
}

// 组件挂载时加载房间
onMounted(() => {
  loadUserRooms()
})
</script>
