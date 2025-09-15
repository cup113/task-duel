import { Router } from 'express'
import { DatabaseService } from '../services/database.mjs'
import { sendSubtaskProgressUpdated } from './events.mjs'
import { logger, logError } from '../services/logging.mjs'

const router = Router()

// 标记子任务完成
router.post('/', async (req, res) => {
  const { subtaskId, userId } = req.body
  try {
    const db = new DatabaseService()

    if (!subtaskId || !userId) {
      return res.status(400).json({ error: '子任务ID和用户ID为必填项' })
    }

    const completion = await db.completeSubtask(subtaskId, userId)

    logger.info('Subtask completed', { subtaskId, userId, completionId: completion.id })

    // 发送子任务进度更新事件
    const user = await db.getUserById(userId)
    const subtask = await db.getSubtaskById(subtaskId)
    if (user && subtask) {
      // 获取任务ID以确定房间
      const task = await db.getTaskById(subtask.task)
      if (task) {
        sendSubtaskProgressUpdated(task.room, subtaskId, userId, user.name, 1)
      }
    }

    res.status(201).json({
      id: completion.id,
      user: completion.user,
      subtask: completion.subtask,
      progress: completion.progress,
      created: completion.created,
      updated: completion.updated,
    })
  } catch (error) {
    logError('Complete subtask failed', error, { subtaskId, userId })
    res.status(500).json({ error: '标记子任务完成失败' })
  }
})

// 获取用户的完成进度
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params
  const { subtaskId } = req.query

  try {
    const db = new DatabaseService()

    const completions = await db.getUserCompletion(userId, subtaskId as string)

    res.json(
      completions.map((completion) => ({
        id: completion.id,
        user: completion.user,
        subtask: completion.subtask,
        progress: completion.progress,
        created: completion.created,
        updated: completion.updated,
      })),
    )
  } catch (error) {
    logError('Get user completion failed', error, { userId, subtaskId })
    res.status(500).json({ error: '获取用户完成进度失败' })
  }
})

// 获取子任务的完成情况
router.get('/subtask/:subtaskId', async (req, res) => {
  const { subtaskId } = req.params

  try {
    const db = new DatabaseService()

    const completions = await db.getSubtaskCompletion(subtaskId)

    res.json(
      completions.map((completion) => ({
        id: completion.id,
        user: completion.user,
        subtask: completion.subtask,
        progress: completion.progress,
        created: completion.created,
        updated: completion.updated,
      })),
    )
  } catch (error) {
    logError('Get subtask completion failed', error, { subtaskId })
    res.status(500).json({ error: '获取子任务完成情况失败' })
  }
})

// 获取房间中所有用户的完成进度
router.get('/room/:roomId', async (req, res) => {
  const { roomId } = req.params

  try {
    const db = new DatabaseService()

    const completions = await db.getRoomCompletions(roomId)

    res.json(
      completions.map((completion) => ({
        id: completion.id,
        user: completion.user,
        subtask: completion.subtask,
        progress: completion.progress,
        created: completion.created,
        updated: completion.updated,
      })),
    )
  } catch (error) {
    logError('Get room completion failed', error, { roomId })
    res.status(500).json({ error: '获取房间完成进度失败' })
  }
})

// 获取用户在任务中的总体进度
router.get('/task/:taskId/user/:userId', async (req, res) => {
  const { taskId, userId } = req.params

  try {
    const db = new DatabaseService()

    const progress = await db.getUserTaskProgress(userId, taskId)

    logger.debug('User task progress retrieved', { userId, taskId, progress })

    res.json({ progress })
  } catch (error) {
    logError('Get user task progress failed', error, { userId, taskId })
    res.status(500).json({ error: '获取用户任务进度失败' })
  }
})

// 更新完成进度
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { progress } = req.body

  try {
    const db = new DatabaseService()

    if (progress === undefined || progress < 0 || progress > 1) {
      return res.status(400).json({ error: '进度值必须在0-1之间' })
    }

    const completion = await db.updateCompletion(id, progress)

    logger.info('Completion updated', { completionId: id, progress })

    // 发送子任务进度更新事件
    const user = await db.getUserById(completion.user)
    const subtask = await db.getSubtaskById(completion.subtask)
    if (user && subtask) {
      // 获取任务ID以确定房间
      const task = await db.getTaskById(subtask.task)
      if (task) {
        sendSubtaskProgressUpdated(task.room, subtask.id, user.id, user.name, progress)
      }
    }

    res.json({
      id: completion.id,
      user: completion.user,
      subtask: completion.subtask,
      progress: completion.progress,
      updated: completion.updated,
    })
  } catch (error) {
    logError('Update completion failed', error, { completionId: id, progress })
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '完成记录不存在' })
    } else {
      res.status(500).json({ error: '更新完成进度失败' })
    }
  }
})

export default router
