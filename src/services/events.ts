import { eventAPI } from './api'
import { useRoomStore } from '@/stores/room'
import type { RoomEvent } from '@/types'
import { taskAPI, subtaskAPI, completionAPI, userAPI } from './api'
import dayjs from 'dayjs'

export class EventService {
  private eventSource: EventSource | null = null
  private roomId: string = ''
  private roomStore: ReturnType<typeof useRoomStore>

  constructor() {
    this.roomStore = useRoomStore()
  }

  // 连接到房间的事件流
  connect(roomId: string) {
    this.roomId = roomId
    this.disconnect() // 先断开现有连接

    this.eventSource = eventAPI.connectToEventStream(roomId)

    this.eventSource.onerror = (error) => {
      console.error('SSE连接错误:', error)
      // 可以在这里实现重连逻辑
    }

    // 只使用特定事件类型的监听器，避免重复处理
    this.eventSource.addEventListener('subtask_progress_updated', (event) => {
      this.handleEvent(JSON.parse((event as MessageEvent).data))
    })

    this.eventSource.addEventListener('user_joined', (event) => {
      this.handleEvent(JSON.parse((event as MessageEvent).data))
    })

    this.eventSource.addEventListener('user_left', (event) => {
      this.handleEvent(JSON.parse((event as MessageEvent).data))
    })

    this.eventSource.addEventListener('task_created', (event) => {
      this.handleEvent(JSON.parse((event as MessageEvent).data))
    })

    this.eventSource.addEventListener('subtask_created', (event) => {
      this.handleEvent(JSON.parse((event as MessageEvent).data))
    })
  }

  // 断开连接
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  // 处理事件
  private handleEvent(event: RoomEvent) {
    switch (event.type) {
      case 'subtask_progress_updated':
        this.handleSubtaskProgressUpdated(event.data)
        break

      case 'user_joined':
        this.handleUserJoined(event.data)
        break

      case 'user_left':
        this.handleUserLeft(event.data)
        break

      case 'task_created':
        this.handleTaskCreated(event.data)
        break

      case 'subtask_created':
        this.handleSubtasksCreated(event.data)
        break

      default:
        console.warn('未知事件类型:', event.type)
    }
  }

  // 处理子任务进度更新事件
  private async handleSubtaskProgressUpdated(data: any) {
    console.log('子任务进度更新:', data)

    // 重新加载完成数据以保持同步
    if (this.roomStore.currentRoom && this.roomStore.currentRoom.id === this.roomId) {
      try {
        const completions = await completionAPI.getUserCompletion(data.userId, data.subtaskId)
        if (completions.length > 0) {
          // 更新store中的完成状态
          const updatedCompletion = { ...completions[0], progress: data.progress, updated: dayjs().toISOString() }
          this.roomStore.updateCompletion(updatedCompletion)
        }
      } catch (error) {
        console.error('重新加载完成数据失败:', error)
      }
    }
  }

  // 处理用户加入事件
  private async handleUserJoined(data: any) {
    console.log('用户加入:', data)

    // 更新房间参与者列表
    if (this.roomStore.currentRoom && this.roomStore.currentRoom.id === this.roomId) {
      if (!this.roomStore.currentRoom.participants.includes(data.userId)) {
        this.roomStore.currentRoom.participants.push(data.userId)
      }
    }

    // 存储用户信息
    try {
      const user = await userAPI.getUserById(data.userId)
      // this.roomStore.setUser(user) // TODO: 需要实现用户存储功能
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 处理用户离开事件
  private handleUserLeft(data: any) {
    console.log('用户离开:', data)

    // 更新房间参与者列表
    if (this.roomStore.currentRoom && this.roomStore.currentRoom.id === this.roomId) {
      const index = this.roomStore.currentRoom.participants.indexOf(data.userId)
      if (index > -1) {
        this.roomStore.currentRoom.participants.splice(index, 1)
      }
    }
  }

  // 处理任务创建事件
  private async handleTaskCreated(data: any) {
    console.log('任务创建:', data)

    // 如果当前在房间页面，重新加载任务列表
    if (this.roomStore.currentRoom && this.roomStore.currentRoom.id === this.roomId) {
      try {
        const tasks = await taskAPI.getRoomTasks(this.roomId)
        this.roomStore.setTasks(tasks)
      } catch (error) {
        console.error('重新加载任务列表失败:', error)
      }
    }
  }

  // 处理子任务创建事件
  private async handleSubtasksCreated(data: any) {
    console.log('子任务创建:', data)

    // 如果当前在任务页面，重新加载子任务列表
    if (this.roomStore.currentRoom && this.roomStore.currentRoom.id === this.roomId) {
      try {
        const subtasks = await subtaskAPI.getTaskSubtasks(data.taskId)
        this.roomStore.setSubtasks(subtasks)
      } catch (error) {
        console.error('重新加载子任务列表失败:', error)
      }
    }
  }

  // 获取当前连接状态
  getConnectionState(): string {
    if (!this.eventSource) return 'disconnected'

    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING:
        return 'connecting'
      case EventSource.OPEN:
        return 'connected'
      case EventSource.CLOSED:
        return 'closed'
      default:
        return 'unknown'
    }
  }
}

// 创建全局事件服务实例
export const eventService = new EventService()
