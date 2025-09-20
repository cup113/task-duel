import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { Room, Task, Subtask, Completion } from '@/types'
import { useAuthStore } from './auth'
import dayjs from 'dayjs'

export const useRoomStore = defineStore('room', () => {
  const currentRoom = ref<Room | null>(null)
  const userRooms = ref<Room[]>([])
  const tasks = ref<Task[]>([])
  const subtasks = ref<Subtask[]>([])
  const completions = ref<Completion[]>([])
  const isLoading = ref(false)

  // 设置当前房间
  const setCurrentRoom = (room: Room) => {
    const userId = useAuthStore().user?.id
    room.participants.sort((a, b) => {
      return -Number(a.id === userId) + Number(b.id === userId)
    })
    currentRoom.value = room
  }

  // 清除当前房间
  const clearCurrentRoom = () => {
    currentRoom.value = null
    tasks.value = []
    subtasks.value = []
    completions.value = []
  }

  // 设置用户房间列表
  const setUserRooms = (rooms: Room[]) => {
    userRooms.value = rooms
  }

  // 设置任务列表
  const setTasks = (taskList: Task[]) => {
    tasks.value = taskList
  }

  // 添加任务
  const addTask = (task: Task) => {
    tasks.value.push(task)
  }

  // 设置子任务列表
  const setSubtasks = (subtaskList: Subtask[]) => {
    subtasks.value = subtaskList
  }

  // 添加子任务
  const addSubtasks = (newSubtasks: Subtask[]) => {
    subtasks.value.push(...newSubtasks)
  }

  // 设置完成记录
  const setCompletions = (completionList: Completion[]) => {
    completions.value = completionList
  }

  // 添加完成记录
  const addCompletion = (completion: Completion) => {
    completions.value.push(completion)
  }

  // 更新完成进度
  const updateCompletionProgress = (completionId: string, progress: number) => {
    const completion = completions.value.find((c) => c.id === completionId)

    if (completion) {
      completion.progress = progress
      completion.updated = dayjs().toISOString()
    }
  }

  // 更新或添加完成记录
  const updateCompletion = (completion: Completion) => {
    const index = completions.value.findIndex((c) => c.id === completion.id)

    if (index > -1) {
      completions.value[index] = completion
    } else {
      completions.value.push(completion)
    }
  }

  // 设置加载状态
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  return {
    currentRoom,
    userRooms,
    tasks,
    subtasks,
    completions,
    isLoading,
    setCurrentRoom,
    clearCurrentRoom,
    setUserRooms,
    setTasks,
    addTask,
    setSubtasks,
    addSubtasks,
    setCompletions,
    addCompletion,
    updateCompletionProgress,
    updateCompletion,
    setLoading,
  }
})
