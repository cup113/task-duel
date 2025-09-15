import { nanoid } from 'nanoid'
import type { TypedPocketBase } from '../types/pocketbase-types.js'
import type {
  UsersRecord,
  RoomsRecord,
  TasksRecord,
  SubtasksRecord,
  CompletionRecord,
  UsersResponse,
  RoomsResponse,
  TasksResponse,
  SubtasksResponse,
  CompletionResponse,
} from '../types/pocketbase-types.js'
import Pocketbase, { ClientResponseError, type RecordAuthResponse } from 'pocketbase'
import { env } from 'process'
import { logger, logError, logWithDbOperation } from './logging.mjs'

type UsersCreate = Omit<UsersRecord, 'id' | 'created' | 'updated' | 'tokenKey'> & {
  passwordConfirm: string
}

export class DatabaseService {
  protected pb: TypedPocketBase

  constructor() {
    const url = env['POCKETBASE_URL'] ?? 'http://localhost:4137/'
    this.pb = new Pocketbase(url)
  }

  // ==================== 用户相关操作 ====================

  /**
   * 创建用户
   */
  async createUser(data: UsersCreate): Promise<UsersResponse> {
    return logWithDbOperation('createUser', () => this.pb.collection('users').create(data), { data })
  }

  /**
   * 通过邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<UsersResponse | null> {
    try {
      return logWithDbOperation(
        'getUserByEmail',
        () => this.pb.collection('users').getFirstListItem(`email="${email}"`),
        { email },
      )
    } catch (error) {
      if (error instanceof ClientResponseError && (error.status === 404 || error.status === 400)) {
        return null
      }
      throw error
    }
  }

  /**
   * 通过ID获取用户
   */
  async getUserById(id: string): Promise<UsersResponse> {
    return logWithDbOperation('getUserById', () => this.pb.collection('users').getOne(id), {
      userId: id,
    })
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: string, data: Partial<UsersRecord>): Promise<UsersResponse> {
    return logWithDbOperation('updateUser', () => this.pb.collection('users').update(id, data), {
      userId: id,
      data,
    })
  }

  /**
   * 用户认证
   */
  async authenticateUser(
    email: string,
    password: string,
  ): Promise<RecordAuthResponse<UsersRecord>> {
    return logWithDbOperation(
      'authenticateUser',
      () => this.pb.collection('users').authWithPassword(email, password),
      { email },
    )
  }

  /**
   * 创建游客用户
   */
  async createGuestUser(name: string, email: string, password: string): Promise<UsersResponse> {
    return logWithDbOperation(
      'createGuestUser',
      () =>
        this.createUser({
          email,
          name,
          password,
          passwordConfirm: password,
          emailVisibility: false,
          verified: false,
        }),
      { name, email },
    )
  }

  // ==================== 房间相关操作 ====================

  /**
   * 创建房间
   */
  async createRoom(data: Omit<RoomsRecord, 'id' | 'created' | 'updated'>): Promise<RoomsResponse> {
    return logWithDbOperation('createRoom', () => this.pb.collection('rooms').create(data), { data })
  }

  /**
   * 通过房间码获取房间
   */
  async getRoomByCode(code: string): Promise<RoomsResponse | null> {
    try {
      return await logWithDbOperation(
        'getRoomByCode',
        () => this.pb.collection('rooms').getFirstListItem(`code="${code}"`),
        { code },
      )
    } catch (error) {
      if (error instanceof ClientResponseError) {
        if (error.status === 404) return null
      }
      throw error
    }
  }

  /**
   * 通过ID获取房间（包含扩展信息）
   */
  async getRoomById(
    id: string,
  ): Promise<RoomsResponse<{ owner: UsersResponse; participants: UsersResponse[] }>> {
    return logWithDbOperation(
      'getRoomById',
      () =>
        this.pb.collection('rooms').getOne(id, {
          expand: 'owner,participants',
        }),
      { roomId: id },
    )
  }

  /**
   * 更新房间信息
   */
  async updateRoom(id: string, data: Partial<RoomsRecord>): Promise<RoomsResponse> {
    return logWithDbOperation('updateRoom', () => this.pb.collection('rooms').update(id, data), {
      roomId: id,
      data,
    })
  }

  /**
   * 添加用户到房间
   */
  async addUserToRoom(roomId: string, userId: string): Promise<RoomsResponse> {
    return logWithDbOperation(
      'addUserToRoom',
      async () => {
        const room = await this.getRoomById(roomId)
        const participants = room.participants || []

        if (!participants.includes(userId)) {
          participants.push(userId)
          return this.updateRoom(roomId, { participants })
        }

        return room
      },
      { roomId, userId },
    )
  }

  /**
   * 从房间移除用户
   */
  async removeUserFromRoom(roomId: string, userId: string): Promise<RoomsResponse> {
    return logWithDbOperation(
      'removeUserFromRoom',
      async () => {
        const room = await this.getRoomById(roomId)
        const participants = room.participants || []

        const updatedParticipants = participants.filter((id) => id !== userId)
        return this.updateRoom(roomId, { participants: updatedParticipants })
      },
      { roomId, userId },
    )
  }

  /**
   * 获取用户加入的所有房间
   */
  async getUserRooms(userId: string): Promise<RoomsResponse[]> {
    return logWithDbOperation(
      'getUserRooms',
      () =>
        this.pb.collection('rooms').getFullList({
          filter: `participants ~ "${userId}"`,
        }),
      { userId },
    )
  }

  // ==================== 任务相关操作 ====================

  /**
   * 创建任务
   */
  async createTask(data: Omit<TasksRecord, 'id' | 'created' | 'updated'>): Promise<TasksResponse> {
    return logWithDbOperation('createTask', () => this.pb.collection('tasks').create(data), { data })
  }

  /**
   * 获取房间的所有任务
   */
  async getRoomTasks(roomId: string): Promise<TasksResponse[]> {
    return logWithDbOperation(
      'getRoomTasks',
      () =>
        this.pb.collection('tasks').getFullList({
          filter: `room="${roomId}"`,
          sort: '-created',
        }),
      { roomId },
    )
  }

  /**
   * 通过ID获取任务
   */
  async getTaskById(id: string): Promise<TasksResponse> {
    return this.pb.collection('tasks').getOne(id)
  }

  /**
   * 更新任务信息
   */
  async updateTask(id: string, data: Partial<TasksRecord>): Promise<TasksResponse> {
    return this.pb.collection('tasks').update(id, data)
  }

  /**
   * 删除任务
   */
  async deleteTask(id: string): Promise<boolean> {
    return this.pb.collection('tasks').delete(id)
  }

  // ==================== 子任务相关操作 ====================

  /**
   * 创建子任务
   */
  async createSubtask(
    data: Omit<SubtasksRecord, 'id' | 'created' | 'updated'>,
  ): Promise<SubtasksResponse> {
    return this.pb.collection('subtasks').create(data, { requestKey: null })
  }

  /**
   * 批量创建子任务
   */
  async createSubtasks(
    subtasks: Omit<SubtasksRecord, 'id' | 'created' | 'updated'>[],
  ): Promise<SubtasksResponse[]> {
    return Promise.all(subtasks.map((subtask) => this.createSubtask(subtask)))
  }

  /**
   * 获取任务的所有子任务
   */
  async getTaskSubtasks(taskId: string): Promise<SubtasksResponse[]> {
    return this.pb.collection('subtasks').getFullList({
      filter: `task="${taskId}"`,
      sort: 'order',
      requestKey: null,
    })
  }

  /**
   * 通过ID获取子任务
   */
  async getSubtaskById(id: string): Promise<SubtasksResponse> {
    return this.pb.collection('subtasks').getOne(id)
  }

  /**
   * 更新子任务信息
   */
  async updateSubtask(id: string, data: Partial<SubtasksRecord>): Promise<SubtasksResponse> {
    return this.pb.collection('subtasks').update(id, data)
  }

  /**
   * 删除子任务
   */
  async deleteSubtask(id: string): Promise<boolean> {
    return this.pb.collection('subtasks').delete(id)
  }

  // ==================== 完成进度相关操作 ====================

  /**
   * 创建完成记录
   */
  async createCompletion(
    data: Omit<CompletionRecord, 'id' | 'created' | 'updated'>,
  ): Promise<CompletionResponse> {
    return this.pb.collection('completion').create(data)
  }

  /**
   * 获取用户的完成进度
   */
  async getUserCompletion(userId: string, subtaskId?: string): Promise<CompletionResponse[]> {
    let filter = `user="${userId}"`
    if (subtaskId) {
      filter += ` && subtask="${subtaskId}"`
    }

    return this.pb.collection('completion').getFullList({
      filter,
      sort: '-updated',
      requestKey: userId,
    })
  }

  /**
   * 更新完成进度
   */
  async updateCompletion(id: string, progress: number): Promise<CompletionResponse> {
    return this.pb.collection('completion').update(id, { progress })
  }

  /**
   * 获取子任务的完成情况
   */
  async getSubtaskCompletion(subtaskId: string): Promise<CompletionResponse[]> {
    return this.pb.collection('completion').getFullList({
      filter: `progress > 0`,
      expand: 'user',
    })
  }

  /**
   * 标记子任务完成
   */
  async completeSubtask(subtaskId: string, userId: string): Promise<CompletionResponse> {
    // 检查是否已有完成记录
    try {
      const existing = await this.pb
        .collection('completion')
        .getFirstListItem(`subtask="${subtaskId}" && user="${userId}"`)
      return this.updateCompletion(existing.id, 1)
    } catch (error) {
      // 如果没有记录，创建新的完成记录
      if (error instanceof ClientResponseError) {
        if (error.status === 404) {
          return this.createCompletion({
            user: userId,
            progress: 1,
            subtask: subtaskId,
          })
        }
      }
      throw error
    }
  }

  /**
   * 获取用户在某任务中的总体进度
   */
  async getUserTaskProgress(userId: string, taskId: string): Promise<number> {
    const subtasks = await this.getTaskSubtasks(taskId)
    if (subtasks.length === 0) return 0

    const completionPromises = subtasks.map(async (subtask) => {
      try {
        const completion = await this.pb
          .collection('completion')
          .getFirstListItem(`subtask="${subtask.id}" && user="${userId}"`)
        return completion.progress
      } catch (error) {
        return 0
      }
    })

    const results = await Promise.all(completionPromises)
    const completedCount = results.reduce((sum, completed) => sum + completed, 0)

    return Math.round((completedCount / subtasks.length) * 100)
  }

  /**
   * 获取房间中所有用户的完成进度
   */
  async getRoomCompletions(roomId: string): Promise<CompletionResponse[]> {
    try {
      // 获取房间的所有任务
      const tasks = await this.pb.collection('tasks').getFullList({
        filter: `room="${roomId}"`,
        requestKey: null,
      })

      if (tasks.length === 0) return []

      // 获取所有任务的子任务
      const allSubtasks: SubtasksResponse[] = []
      for (const task of tasks) {
        const subtasks = await this.getTaskSubtasks(task.id)
        allSubtasks.push(...subtasks)
      }

      if (allSubtasks.length === 0) return []

      // 获取所有子任务的完成记录
      const subtaskIds = allSubtasks.map((subtask) => subtask.id)

      // 使用更简单的filter构建方式
      const completions: CompletionResponse[] = []

      // 分批获取完成记录，避免filter过长
      const batchSize = 10
      for (let i = 0; i < subtaskIds.length; i += batchSize) {
        const batch = subtaskIds.slice(i, i + batchSize)
        const batchFilter = batch.map((id) => `subtask="${id}"`).join('||')

        const batchCompletions = await this.pb.collection('completion').getFullList({
          filter: batchFilter,
          expand: 'user',
        })

        completions.push(...batchCompletions)
      }

      return completions
    } catch (error) {
      console.error('获取房间完成进度错误:', error)
      return []
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 生成唯一的房间码
   */
  async generateUniqueRoomCode(): Promise<string> {
    let code: string
    let exists = true

    // 尝试生成唯一代码，最多尝试10次
    for (let i = 0; i < 10 && exists; i++) {
      code = nanoid(4)

      try {
        exists = (await this.getRoomByCode(code)) !== null
      } catch (error) {
        if (error instanceof ClientResponseError) {
          if (error.status === 404) {
            exists = false // 代码可用
          }
          throw error
        }
        throw error
      }
    }

    if (exists) {
      throw new Error('无法生成唯一的房间代码')
    }

    return code!
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.pb.health.check()
      return true
    } catch (error) {
      return false
    }
  }
}
