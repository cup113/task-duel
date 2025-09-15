import { Router } from 'express'
import { DatabaseService } from '../services/database.mjs'
import { sendTaskCreated } from './events.mjs'
import { logger, logError } from '../services/logging.mjs'

const router = Router()
const db = new DatabaseService()

// 创建任务
router.post('/', async (req, res) => {
  const { title, roomId } = req.body

  try {
    if (!title || !roomId) {
      logger.warn('Create task validation failed', { title: !!title, roomId: !!roomId })
      return res.status(400).json({ error: '任务标题和房间ID为必填项' })
    }

    const task = await db.createTask({
      title,
      room: roomId,
    })

    // 发送任务创建事件
    sendTaskCreated(roomId, task.id, task.title)

    logger.info('Task created successfully', { taskId: task.id, roomId, title })

    res.status(201).json({
      id: task.id,
      title: task.title,
      room: task.room,
      created: task.created,
    })
  } catch (error) {
    logError('Create task failed', error, { title, roomId })
    res.status(500).json({ error: '创建任务失败' })
  }
})

// 获取房间的所有任务
router.get('/room/:roomId', async (req, res) => {
  const { roomId } = req.params

  try {
    const tasks = await db.getRoomTasks(roomId)

    logger.debug('Room tasks retrieved', { roomId, taskCount: tasks.length })

    res.json(
      tasks.map((task) => ({
        id: task.id,
        title: task.title,
        room: task.room,
        created: task.created,
        updated: task.updated,
      })),
    )
  } catch (error) {
    logError('Get room tasks failed', error, { roomId })
    res.status(500).json({ error: '获取任务列表失败' })
  }
})

// 获取任务详情
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const task = await db.getTaskById(id)

    logger.debug('Task retrieved by id', { taskId: id })

    res.json({
      id: task.id,
      title: task.title,
      room: task.room,
      created: task.created,
      updated: task.updated,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      logger.warn('Task not found by id', { taskId: id })
      res.status(404).json({ error: '任务不存在' })
    } else {
      logError('Get task by id failed', error, { taskId: id })
      res.status(500).json({ error: '获取任务信息失败' })
    }
  }
})

// 更新任务
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { title } = req.body

  try {
    if (!title) {
      logger.warn('Update task validation failed', { taskId: id, title: !!title })
      return res.status(400).json({ error: '任务标题为必填项' })
    }

    const task = await db.updateTask(id, { title })

    logger.info('Task updated successfully', { taskId: id, newTitle: title })

    res.json({
      id: task.id,
      title: task.title,
      room: task.room,
      updated: task.updated,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      logger.warn('Task not found when updating', { taskId: id })
      res.status(404).json({ error: '任务不存在' })
    } else {
      logError('Update task failed', error, { taskId: id, title })
      res.status(500).json({ error: '更新任务失败' })
    }
  }
})

// 删除任务
router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    await db.deleteTask(id)

    logger.info('Task deleted successfully', { taskId: id })

    res.json({ message: '任务删除成功' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      logger.warn('Task not found when deleting', { taskId: id })
      res.status(404).json({ error: '任务不存在' })
    } else {
      logError('Delete task failed', error, { taskId: id })
      res.status(500).json({ error: '删除任务失败' })
    }
  }
})

export default router
