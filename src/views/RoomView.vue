<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 简化导航栏 -->
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <button
              @click="router.push('/')"
              class="text-gray-600 hover:text-gray-900 flex items-center transition-colors"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              首页
            </button>
            <div class="h-6 w-px bg-gray-300"></div>
            <h1
              class="text-xl font-semibold text-gray-900 truncate max-w-xs"
              :title="roomStore.currentRoom?.name"
            >
              {{ roomStore.currentRoom?.name }}
            </h1>
            <span
              @click="copyRoomCode"
              class="text-sm text-gray-500 cursor-pointer hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center"
              title="点击复制房间码"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              房间码: {{ roomStore.currentRoom?.code }}
            </span>
          </div>

          <div class="flex items-center space-x-3">
            <div class="flex items-center bg-gray-100 rounded-full px-3 py-1">
              <div
                class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs mr-2"
              >
                {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
              </div>
              <span class="text-sm text-gray-700">
                {{ authStore.user?.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-4 px-4 sm:px-6">
      <div class="space-y-6">
        <!-- 任务列表 -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="flex justify-between items-center p-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center">
              <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              任务列表
              <span class="ml-2 text-sm text-gray-500 font-normal">
                ({{ roomStore.tasks.length }})
              </span>
            </h2>
            <button
              @click="showCreateTaskModal = true"
              class="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              创建任务
            </button>
          </div>

          <!-- 任务列表 -->
          <div v-if="roomStore.tasks.length > 0" class="divide-y">
            <TaskCard v-for="task in roomStore.tasks" :key="task.id" :task="task" />
          </div>

          <!-- 空状态 -->
          <div v-else class="text-center py-8 text-gray-500">
            <svg
              class="w-12 h-12 mx-auto text-gray-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p class="text-sm">还没有任务，点击"创建任务"开始吧！</p>
          </div>
        </div>

        <!-- 房间成员 -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-4 border-b">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              房间成员
              <span class="ml-2 text-sm text-gray-500 font-normal">
                ({{ roomStore.currentRoom?.participants?.length || 0 }})
              </span>
            </h2>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <div
              v-for="participant in roomStore.currentRoom?.participants || []"
              :key="participant.id"
              class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium rounded-full shadow-sm"
              >
                {{ participant.name.charAt(0).toUpperCase() }}
              </div>
              <div class="ml-3">
                <p
                  class="text-sm font-medium text-gray-900 truncate max-w-[120px]"
                  :title="participant.name"
                >
                  {{ participant.name }}
                </p>
                <p class="text-xs text-gray-500 flex items-center">
                  <span
                    class="w-2 h-2 rounded-full mr-1"
                    :class="{
                      'bg-green-500': participant.id === roomStore.currentRoom?.owner,
                      'bg-gray-400': participant.id !== roomStore.currentRoom?.owner,
                    }"
                  ></span>
                  {{ participant.id === roomStore.currentRoom?.owner ? '房主' : '成员' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 创建任务模态框 -->
    <div
      v-if="showCreateTaskModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div class="bg-gray-50 px-6 py-4 border-b">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg
              class="w-5 h-5 mr-2 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            创建任务
          </h3>
        </div>

        <form @submit.prevent="handleCreateTask" class="p-6">
          <div class="mb-5">
            <label for="task-title" class="block text-sm font-medium text-gray-700 mb-2">
              任务标题
            </label>
            <input
              id="task-title"
              v-model="newTaskTitle"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="请输入任务标题"
              autofocus
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="showCreateTaskModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="roomStore.isLoading || !newTaskTitle.trim()"
              class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              创建任务
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore, useRoomStore } from '@/stores'
import { taskAPI, roomAPI, subtaskAPI, completionAPI } from '@/services/api'
import { eventService } from '@/services/events'
import TaskCard from '@/components/TaskCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const roomStore = useRoomStore()

const showCreateTaskModal = ref(false)
const newTaskTitle = ref('')

// 获取房间ID
const roomId = computed(() => route.params.id as string)

// 加载房间数据
const loadRoomData = async () => {
  try {
    roomStore.setLoading(true)

    // 加载房间信息（包含扩展的用户信息）
    const room = await roomAPI.getRoomById(roomId.value)
    roomStore.setCurrentRoom(room)

    // 加载任务列表
    const tasks = await taskAPI.getRoomTasks(roomId.value)
    roomStore.setTasks(tasks)

    // 加载所有子任务
    const allSubtasks: any[] = []
    for (const task of tasks) {
      const taskSubtasks = await subtaskAPI.getTaskSubtasks(task.id)
      allSubtasks.push(...taskSubtasks)
    }
    roomStore.setSubtasks(allSubtasks)

    // 加载房间中所有用户的完成进度
    const allCompletions = await completionAPI.getRoomCompletions(roomId.value)
    console.log(allCompletions)
    roomStore.setCompletions(allCompletions)
  } catch (error) {
    console.error('加载房间数据失败:', error)
    alert('加载房间数据失败')
    router.push('/')
  } finally {
    roomStore.setLoading(false)
  }
}

// 创建任务
const handleCreateTask = async () => {
  try {
    roomStore.setLoading(true)

    const task = await taskAPI.createTask({
      title: newTaskTitle.value,
      roomId: roomId.value,
    })

    roomStore.addTask(task)
    showCreateTaskModal.value = false
    newTaskTitle.value = ''

    // 不再跳转到任务页面，任务会自动在列表中展示
  } catch (error) {
    console.error('创建任务失败:', error)
    alert('创建任务失败')
  } finally {
    roomStore.setLoading(false)
  }
}

// 复制房间码
const copyRoomCode = () => {
  if (roomStore.currentRoom?.code) {
    navigator.clipboard.writeText(roomStore.currentRoom.code)
    alert('房间码已复制到剪贴板')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRoomData()

  // 连接到实时事件流
  if (roomId.value) {
    eventService.connect(roomId.value)
  }
})

// 组件卸载时断开连接
onUnmounted(() => {
  eventService.disconnect()
})

// 监听路由参数变化
import { watch } from 'vue'
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadRoomData()

      // 重新连接到新房间的事件流
      eventService.disconnect()
      eventService.connect(newId as string)
    }
  },
)
</script>
