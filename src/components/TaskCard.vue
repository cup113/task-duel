<template>
  <div class="bg-white border-b border-gray-100">
    <!-- 任务头部 - 可点击收起/展开 -->
    <div class="p-3 cursor-pointer hover:bg-gray-50" @click="toggleExpanded">
      <div class="flex justify-between items-center">
        <div class="flex-1">
          <h3 class="text-md font-medium text-gray-900">{{ task.title }}</h3>
          <div class="mt-1 flex items-center text-sm text-gray-600 space-x-2">
            <span>{{ subtasks.length }} 个子任务</span>
            <span>•</span>
            <span>{{ completionRate }}% 完成</span>
            <span class="text-xs text-gray-400">{{ formatDate(task.created) }}</span>
          </div>
        </div>

        <svg class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0" :class="{ 'rotate-180': isExpanded }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <div>
      <!-- 子任务内容 - 展开时显示 -->
      <div v-if="isExpanded" class="bg-gray-50">
        <div class="bg-white px-4 py-3">
          <!-- 响应式子任务矩阵 -->
          <div class="overflow-x-auto">
            <!-- 用户表头 - 固定在顶部 -->
            <div class="grid grid-cols-1 gap-2 min-w-max">
              <!-- 表头行 -->
              <div
                class="grid grid-cols-[200px_repeat(auto-fit,minmax(80px,1fr))] gap-2 sticky top-0 bg-white z-10 pb-2 border-b">
                <div class="text-sm font-medium text-gray-500 py-2">子任务</div>
                <div v-for="(participant, index) in participants" :key="participant.id"
                  class="text-sm font-medium text-gray-500 py-2 px-2 text-center truncate" :title="participant.name">
                  {{ participant.name }}
                </div>
              </div>

              <!-- 子任务行 -->
              <div v-for="subtask in sortedSubtasks" :key="subtask.id"
                class="grid grid-cols-[200px_repeat(auto-fit,minmax(80px,1fr))] gap-2 items-center py-2 hover:bg-gray-50 rounded">
                <!-- 子任务标题 -->
                <div class="text-sm font-medium text-gray-900 truncate" :title="subtask.title">
                  {{ subtask.title }}
                </div>

                <!-- 用户状态单元格 -->
                <div v-for="participant in participants" :key="participant.id" class="flex justify-center">
                  <button @click="handleSubtaskClick(subtask.id, participant.id)"
                    class="w-16 h-8 rounded-lg border-2 flex flex-col items-center justify-center text-sm transition-all duration-200"
                    :class="{
                      // 状态样式
                      'border-green-500 bg-green-100 text-green-700 shadow-sm': isSubtaskCompleted(
                        subtask.id,
                        participant.id,
                      ),
                      'border-blue-500 bg-blue-100 text-blue-700 shadow-sm': isSubtaskInProgress(
                        subtask.id,
                        participant.id,
                      ),
                      'border-gray-300 bg-gray-50 text-gray-400':
                        !isSubtaskCompleted(subtask.id, participant.id) &&
                        !isSubtaskInProgress(subtask.id, participant.id),

                      // 交互样式
                      'hover:scale-105 hover:shadow-md cursor-pointer':
                        participant.id === authStore.user?.id,
                      'opacity-60': participant.id !== authStore.user?.id,

                      // 动画效果
                      'animate-pulse': isSubtaskInProgress(subtask.id, participant.id),
                    }" :disabled="participant.id !== authStore.user?.id" :title="participant.id === authStore.user?.id ? '点击更新状态' : participant.name
                      ">
                    <!-- 时间显示 -->
                    <span v-if="(getSubtaskCompletion(subtask.id, participant.id)?.progress ?? 0) > 0"
                      class="text-xs text-gray-500">
                      {{
                        formatTime(getSubtaskCompletion(subtask.id, participant.id)?.updated || '')
                      }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="sortedSubtasks.length === 0" class="text-center py-8 text-gray-500">
            还没有子任务
          </div>

          <!-- 添加子任务按钮 -->
          <div class="mt-3 flex justify-end">
            <button @click="showCreateSubtaskModal = true"
              class="bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700">
              添加子任务
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 简化添加子任务模态框 -->
    <div v-if="showCreateSubtaskModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white p-6 w-full max-w-sm">
        <h3 class="text-lg font-medium text-gray-900 mb-4">添加子任务</h3>

        <form @submit.prevent="handleCreateSubtasks">
          <div class="mb-4">
            <label for="subtasks" class="block text-sm font-medium text-gray-700 mb-1">
              子任务列表（每行一个，支持"3~8"格式）
            </label>
            <textarea id="subtasks" v-model="subtasksText" rows="6" required
              class="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="请输入子任务，每行一个&#10;例如：&#10;1&#10;2&#10;3~5&#10;6" />
          </div>

          <div class="flex justify-end space-x-3">
            <button type="button" @click="showCreateSubtaskModal = false"
              class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
              取消
            </button>
            <button type="submit" :disabled="roomStore.isLoading"
              class="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50">
              添加
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 撤销完成确认模态框 -->
    <div v-if="showUndoConfirmModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white p-6 w-full max-w-xs">
        <h3 class="text-lg font-medium text-gray-900 mb-4">撤销完成</h3>
        <p class="text-sm text-gray-600 mb-6">确定要撤销这个子任务的完成状态吗？</p>

        <div class="flex justify-end space-x-3">
          <button type="button" @click="showUndoConfirmModal = false"
            class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
            取消
          </button>
          <button @click="undoSubtaskCompletion" class="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700">
            确认撤销
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore, useRoomStore } from '@/stores'
import { subtaskAPI, completionAPI } from '@/services/api'
import dayjs from 'dayjs'

const props = defineProps<{
  task: any
}>()

const authStore = useAuthStore()
const roomStore = useRoomStore()

const isExpanded = ref(true)
const showCreateSubtaskModal = ref(false)
const showUndoConfirmModal = ref(false)
const subtasksText = ref('')
const undoSubtaskId = ref('')
const undoUserId = ref('')

// 获取当前任务的子任务
const subtasks = computed(() => {
  return roomStore.subtasks.filter((subtask) => subtask.task === props.task.id)
})

// 获取排序后的子任务
const sortedSubtasks = computed(() => {
  return [...subtasks.value].sort((a, b) => a.order - b.order)
})

// 获取房间成员
const participants = computed(() => {
  if (!roomStore.currentRoom) return []

  return roomStore.currentRoom.participants
})

// 计算完成率
const completionRate = computed(() => {
  if (subtasks.value.length === 0) return 0

  const completed = subtasks.value.filter((subtask) =>
    isSubtaskCompleted(subtask.id, authStore.user!.id),
  ).length

  return Math.round((completed / subtasks.value.length) * 100)
})

// 检查子任务是否完成
const isSubtaskCompleted = (subtaskId: string, userId: string) => {
  const completion = getSubtaskCompletion(subtaskId, userId)
  return completion?.progress === 1
}

// 检查子任务是否正在进行
const isSubtaskInProgress = (subtaskId: string, userId: string) => {
  const completion = getSubtaskCompletion(subtaskId, userId)
  return completion && completion.progress > 0 && completion.progress < 1
}

// 获取子任务完成记录
const getSubtaskCompletion = (subtaskId: string, userId: string) => {
  return roomStore.completions.find((c) => c.user === userId && c.subtask === subtaskId)
}

// 切换展开状态
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// 处理子任务点击
const handleSubtaskClick = async (subtaskId: string, userId: string) => {
  if (userId !== authStore.user?.id) return

  try {
    const completion = getSubtaskCompletion(subtaskId, userId)

    if (completion?.progress === 1) {
      // 已完成状态，弹出撤销确认
      undoSubtaskId.value = subtaskId
      undoUserId.value = userId
      showUndoConfirmModal.value = true
      return
    }

    let newProgress = 0.1 // 第一次点击：开始工作(10%)

    if (completion?.progress === 0.1) {
      newProgress = 1 // 第二次点击：完成(100%)
    }

    if (completion) {
      // 更新现有完成记录
      await completionAPI.updateCompletion(completion.id, newProgress)
      roomStore.updateCompletionProgress(completion.id, newProgress)
    } else {
      // 创建新的完成记录
      const newCompletion = await completionAPI.completeSubtask(subtaskId, userId)
      await completionAPI.updateCompletion(newCompletion.id, newProgress)
      roomStore.addCompletion({ ...newCompletion, progress: newProgress })
    }
  } catch (error) {
    console.error('更新子任务状态失败:', error)
    alert('操作失败')
  }
}

// 撤销子任务完成
const undoSubtaskCompletion = async () => {
  try {
    const completion = getSubtaskCompletion(undoSubtaskId.value, undoUserId.value)
    if (completion) {
      await completionAPI.updateCompletion(completion.id, 0)
      roomStore.updateCompletionProgress(completion.id, 0)
    }
    showUndoConfirmModal.value = false
  } catch (error) {
    console.error('撤销完成失败:', error)
    alert('撤销完成失败')
  }
}

// 批量创建子任务
const handleCreateSubtasks = async () => {
  try {
    roomStore.setLoading(true)

    const subtaskLines = subtasksText.value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (subtaskLines.length === 0) {
      alert('请输入有效的子任务')
      return
    }

    const createdSubtasks = await subtaskAPI.createSubtasks(props.task.id, subtaskLines)
    roomStore.addSubtasks(createdSubtasks)

    showCreateSubtaskModal.value = false
    subtasksText.value = ''
  } catch (error) {
    console.error('创建子任务失败:', error)
    alert('创建子任务失败')
  } finally {
    roomStore.setLoading(false)
  }
}

const formatTime = (dateString: string) => {
  return dayjs(dateString).format('HH:mm')
}

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY/MM/DD hh:mm')
}
</script>
