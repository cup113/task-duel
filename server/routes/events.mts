import { Router, type Response } from 'express'
import { logger } from '../services/logging.mjs'

const router = Router()

// 存储活跃的SSE连接
const activeConnections = new Map<string, Response[]>()

// SSE实时事件流
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params

  // 设置SSE头
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Accel-Buffering', 'no')

  // 将连接添加到活跃连接列表
  if (!activeConnections.has(roomId)) {
    activeConnections.set(roomId, [])
  }
  activeConnections.get(roomId)!.push(res)

  // 发送初始连接确认
  res.write(`event: connected\ndata: {\"message\": \"Connected to room ${roomId}\"}\n\n`)
  logger.info('SSE connection established', {
    roomId,
    connectionCount: activeConnections.get(roomId)!.length,
  })

  // 处理连接关闭
  req.on('close', () => {
    const connections = activeConnections.get(roomId)
    if (connections) {
      const index = connections.indexOf(res)
      if (index > -1) {
        connections.splice(index, 1)
      }
      if (connections.length === 0) {
        activeConnections.delete(roomId)
      }
    }
    logger.info('SSE connection closed', { roomId, remainingConnections: connections?.length || 0 })
    res.end()
  })
})

// 广播事件到房间的所有连接
export function broadcastToRoom(roomId: string, event: string, data: any) {
  const connections = activeConnections.get(roomId)
  if (connections) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`

    logger.debug('Broadcasting event to room', {
      roomId,
      event,
      connectionCount: connections.length,
    })

    // 使用反向遍历避免索引问题
    for (let i = connections.length - 1; i >= 0; i--) {
      try {
        connections[i].write(message)
      } catch (error) {
        // 移除失效的连接
        connections.splice(i, 1)
        logger.warn('Removed broken SSE connection', { roomId })
      }
    }

    // 清理空连接列表
    if (connections.length === 0) {
      activeConnections.delete(roomId)
      logger.info('Room SSE connections cleared', { roomId })
    }
  }
}

// 事件类型定义
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

// 发送子任务进度更新事件
export function sendSubtaskProgressUpdated(
  roomId: string,
  subtaskId: string,
  userId: string,
  userName: string,
  progress: number,
) {
  const event: RoomEvent = {
    type: 'subtask_progress_updated',
    data: {
      subtaskId,
      userId,
      userName,
      progress,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  }
  broadcastToRoom(roomId, 'subtask_progress_updated', event)
}

// 发送用户加入事件
export function sendUserJoined(roomId: string, userId: string, userName: string) {
  const event: RoomEvent = {
    type: 'user_joined',
    data: {
      userId,
      userName,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  }
  broadcastToRoom(roomId, 'user_joined', event)
}

// 发送用户离开事件
export function sendUserLeft(roomId: string, userId: string, userName: string) {
  const event: RoomEvent = {
    type: 'user_left',
    data: {
      userId,
      userName,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  }
  broadcastToRoom(roomId, 'user_left', event)
}

// 发送任务创建事件
export function sendTaskCreated(roomId: string, taskId: string, taskTitle: string) {
  const event: RoomEvent = {
    type: 'task_created',
    data: {
      taskId,
      taskTitle,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  }
  broadcastToRoom(roomId, 'task_created', event)
}

// 发送子任务创建事件
export function sendSubtasksCreated(roomId: string, taskId: string, subtasksCount: number) {
  const event: RoomEvent = {
    type: 'subtask_created',
    data: {
      taskId,
      subtasksCount,
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  }
  broadcastToRoom(roomId, 'subtask_created', event)
}

export default router
