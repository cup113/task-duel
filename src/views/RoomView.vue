<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 简化导航栏 -->
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex justify-between items-center h-14">
          <div class="flex items-center space-x-3">
            <button @click="router.push('/')" class="text-gray-600 hover:text-gray-900">
              ← 首页
            </button>
            <h1 class="text-lg font-medium text-gray-900">{{ roomStore.currentRoom?.name }}</h1>
            <span
              @click="copyRoomCode"
              class="text-sm text-gray-500 cursor-pointer hover:text-blue-600"
              title="点击复制房间码"
            >
              房间码: {{ roomStore.currentRoom?.code }}
            </span>
          </div>

          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-600 hidden sm:inline">
              {{ authStore.user?.name }}
            </span>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-4 px-4 sm:px-6">
      <div class="space-y-4">
        <!-- 简化任务列表 -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900">任务列表</h2>
            <button
              @click="showCreateTaskModal = true"
              class="bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700"
            >
              创建任务
            </button>
          </div>

          <!-- 任务列表 - 平行展示所有任务 -->
          <div v-if="roomStore.tasks.length > 0" class="space-y-3">
            <TaskCard v-for="task in roomStore.tasks" :key="task.id" :task="task" />
          </div>

          <!-- 空状态 -->
          <div v-else class="text-center py-6 text-gray-500">
            还没有任务，点击"创建任务"开始吧！
          </div>
        </div>

        <!-- 简化房间成员 -->
        <div>
          <h2 class="text-lg font-medium text-gray-900 mb-4">房间成员</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="participant in roomStore.currentRoom?.participants || []"
              :key="participant.id"
              class="bg-white p-3 border-b border-gray-100"
            >
              <div class="flex items-center">
                <div
                  class="w-8 h-8 bg-blue-500 flex items-center justify-center text-white text-sm"
                >
                  {{ participant.name.charAt(0).toUpperCase() }}
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    {{ participant.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ participant.id === roomStore.currentRoom?.owner ? '房主' : '成员' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 简化创建任务模态框 -->
    <div
      v-if="showCreateTaskModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white p-6 w-full max-w-sm">
        <h3 class="text-lg font-medium text-gray-900 mb-4">创建任务</h3>

        <form @submit.prevent="handleCreateTask">
          <div class="mb-4">
            <label for="task-title" class="block text-sm font-medium text-gray-700 mb-1"
              >任务标题</label
            >
            <input
              id="task-title"
              v-model="newTaskTitle"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="请输入任务标题"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showCreateTaskModal = false"
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
