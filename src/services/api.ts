import { useAuthStore } from '@/stores/auth'
import type {
  AuthResponse,
  RoomResponse,
  TaskResponse,
  SubtaskResponse,
  CompletionResponse,
  User,
} from '@/types'

// 通用API请求函数
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const authStore = useAuthStore()
  const url = `/api${endpoint}`

  const headers: HeadersInit = authStore.user?.token
    ? {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authStore.user.token}`,
      ...options.headers,
    }
    : {
      'Content-Type': 'application/json',
      ...options.headers,
    }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 认证API
export const authAPI = {
  // 用户注册
  register: (data: { email: string; name: string; password: string }) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 用户登录
  login: (data: { email: string; password: string }) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 创建游客账户
  createGuest: (name?: string) =>
    apiRequest<AuthResponse>('/auth/guest', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
}

// 用户API
export const userAPI = {
  // 通过ID获取用户信息
  getUserById: (id: string) => apiRequest<User>(`/users/${id}`),

  // 批量获取用户信息
  getUsersByIds: (ids: string[]) =>
    apiRequest<User[]>(`/users/batch`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  // 更新用户信息
  updateUser: (id: string, data: { name?: string; email?: string }) =>
    apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// 房间API
export const roomAPI = {
  // 创建房间
  createRoom: (data: { name: string; ownerId: string }) =>
    apiRequest<RoomResponse>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 通过房间码获取房间
  getRoomByCode: (code: string) => apiRequest<RoomResponse>(`/rooms/code/${code}`),

  // 通过ID获取房间（包含扩展的用户信息）
  getRoomById: (id: string) =>
    apiRequest<Omit<RoomResponse, 'participants'> & { participants: User[] }>(`/rooms/${id}`),

  // 获取用户的所有房间
  getUserRooms: (userId: string) => apiRequest<RoomResponse[]>(`/rooms/user/${userId}`),

  // 添加用户到房间
  addUserToRoom: (roomId: string, userId: string) =>
    apiRequest<RoomResponse>(`/rooms/${roomId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // 从房间移除用户
  removeUserFromRoom: (roomId: string, userId: string) =>
    apiRequest<RoomResponse>(`/rooms/${roomId}/participants/${userId}`, {
      method: 'DELETE',
    }),
}

// 任务API
export const taskAPI = {
  // 创建任务
  createTask: (data: { title: string; roomId: string }) =>
    apiRequest<TaskResponse>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取房间的所有任务
  getRoomTasks: (roomId: string) => apiRequest<TaskResponse[]>(`/tasks/room/${roomId}`),

  // 获取任务详情
  getTaskById: (id: string) => apiRequest<TaskResponse>(`/tasks/${id}`),

  // 更新任务
  updateTask: (id: string, data: { title: string }) =>
    apiRequest<TaskResponse>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除任务
  deleteTask: (id: string) =>
    apiRequest<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
}

// 子任务API
export const subtaskAPI = {
  // 批量创建子任务
  createSubtasks: (taskId: string, subtasks: string[]) =>
    apiRequest<SubtaskResponse[]>('/subtasks/batch', {
      method: 'POST',
      body: JSON.stringify({ taskId, subtasks }),
    }),

  // 获取任务的所有子任务
  getTaskSubtasks: (taskId: string) => apiRequest<SubtaskResponse[]>(`/subtasks/task/${taskId}`),

  // 获取子任务详情
  getSubtaskById: (id: string) => apiRequest<SubtaskResponse>(`/subtasks/${id}`),

  // 更新子任务
  updateSubtask: (id: string, data: { title?: string; order?: number }) =>
    apiRequest<SubtaskResponse>(`/subtasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除子任务
  deleteSubtask: (id: string) =>
    apiRequest<{ message: string }>(`/subtasks/${id}`, {
      method: 'DELETE',
    }),
}

// 完成进度API
export const completionAPI = {
  // 标记子任务完成
  completeSubtask: (subtaskId: string, userId: string) =>
    apiRequest<CompletionResponse>('/completion', {
      method: 'POST',
      body: JSON.stringify({ subtaskId, userId }),
    }),

  // 获取用户的完成进度
  getUserCompletion: (userId: string, subtaskId?: string) =>
    apiRequest<CompletionResponse[]>(
      `/completion/user/${userId}${subtaskId ? `?subtaskId=${subtaskId}` : ''}`,
    ),

  // 获取子任务的完成情况
  getSubtaskCompletion: (subtaskId: string) =>
    apiRequest<CompletionResponse[]>(`/completion/subtask/${subtaskId}`),

  // 获取用户在任务中的总体进度
  getUserTaskProgress: (taskId: string, userId: string) =>
    apiRequest<{ progress: number }>(`/completion/task/${taskId}/user/${userId}`),

  // 获取房间中所有用户的完成进度
  getRoomCompletions: (roomId: string) =>
    apiRequest<CompletionResponse[]>(`/completion/room/${roomId}`),

  // 更新完成进度
  updateCompletion: (id: string, progress: number) =>
    apiRequest<CompletionResponse>(`/completion/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    }),
}

// 事件API
export const eventAPI = {
  // 连接到SSE事件流
  connectToEventStream: (roomId: string) => {
    return new EventSource(`/api/events/${roomId}`)
  },
}
