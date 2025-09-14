export interface User {
  id: string
  name: string
  email: string
  isGuest: boolean
}

export interface Room {
  id: string
  code: string
  name: string
  owner: string
  participants: string[]
  tasks: Task[]
}

export interface Task {
  id: string
  title: string
  subtasks: Subtask[]
}

export interface Subtask {
  id: string
  title: string
  order: number
  completion: Completion[]
}

export interface Completion {
  userId: string
  completed: boolean
  completedAt?: Date
  progress?: number
}

export interface CreateRoomData {
  name: string
  userId: string
}

export interface JoinRoomData {
  roomCode: string
  userId: string
}

export interface CreateTaskData {
  roomId: string
  title: string
  subtasks: string[]
  userId: string
}

export interface UpdateSubtaskData {
  roomId: string
  taskId: string
  subtaskId: string
  userId: string
  completed: boolean
  progress?: number
}
