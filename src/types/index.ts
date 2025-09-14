// 核心类型定义 - 单一事实来源
// 所有其他类型都应该从这里派生或引用

export interface User {
  id: string
  email: string
  name: string
  isGuest?: boolean
  token?: string // 仅用于认证响应
  password?: string // 仅用于游客账户创建
}

export interface Room {
  id: string
  name: string
  code: string
  owner: string // 用户ID
  participants: User[]
  created: string // ISO日期字符串
}

export interface Task {
  id: string
  title: string
  room: string // 房间ID
  created: string // ISO日期字符串
  updated: string // ISO日期字符串
}

export interface Subtask {
  id: string
  title: string
  task: string // 任务ID
  order: number
  created: string // ISO日期字符串
  updated: string // ISO日期字符串
}

export interface Completion {
  id: string
  user: string // 用户ID
  subtask: string // 子任务ID
  progress: number // 0-100 进度百分比
  created: string // ISO日期字符串
  updated: string // ISO日期字符串
}

// API响应类型 - 基于核心类型但保持向后兼容
export interface AuthResponse {
  id: string
  email: string
  name: string
  token?: string
  isGuest?: boolean
  password?: string
}

export interface RoomResponse extends Room {}
export interface TaskResponse extends Task {}
export interface SubtaskResponse extends Subtask {}
export interface CompletionResponse extends Completion {}

// 事件相关类型
export interface RoomEvent {
  type:
    | 'subtask_progress_updated'
    | 'user_joined'
    | 'user_left'
    | 'task_created'
    | 'subtask_created'
  data: any
  timestamp: number
}

// 实用类型
export type ID = string
export type Timestamp = string // ISO日期字符串

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  perPage: number
}

// 类型守卫
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string'
  )
}

export function isRoom(obj: any): obj is Room {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.code === 'string'
  )
}

export function isTask(obj: any): obj is Task {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.room === 'string'
  )
}

export function isSubtask(obj: any): obj is Subtask {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.task === 'string'
  )
}

export function isCompletion(obj: any): obj is Completion {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user === 'string' &&
    typeof obj.subtask === 'string'
  )
}
