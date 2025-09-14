import { Router } from 'express'
import { DatabaseService } from '../services/database.mjs'
import { sendTaskCreated } from './events.mjs'

const router = Router()
const db = new DatabaseService()

// 创建任务
router.post('/', async (req, res) => {
  try {
    const { title, roomId } = req.body

    if (!title || !roomId) {
      return res.status(400).json({ error: '任务标题和房间ID为必填项' })
    }

    const task = await db.createTask({
      title,
      room: roomId,
    })

    // 发送任务创建事件
    sendTaskCreated(roomId, task.id, task.title)

    res.status(201).json({
      id: task.id,
      title: task.title,
      room: task.room,
      created: task.created,
    })
  } catch (error) {
    console.error('创建任务错误:', error)
    res.status(500).json({ error: '创建任务失败' })
  }
})

// 获取房间的所有任务
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params

    const tasks = await db.getRoomTasks(roomId)

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
    console.error('获取任务错误:', error)
    res.status(500).json({ error: '获取任务列表失败' })
  }
})

// 获取任务详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const task = await db.getTaskById(id)

    res.json({
      id: task.id,
      title: task.title,
      room: task.room,
      created: task.created,
      updated: task.updated,
    })
  } catch (error) {
    console.error('获取任务错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '任务不存在' })
    } else {
      res.status(500).json({ error: '获取任务信息失败' })
    }
  }
})

// 更新任务
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title } = req.body

    if (!title) {
      return res.status(400).json({ error: '任务标题为必填项' })
    }

    const task = await db.updateTask(id, { title })

    res.json({
      id: task.id,
      title: task.title,
      room: task.room,
      updated: task.updated,
    })
  } catch (error) {
    console.error('更新任务错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '任务不存在' })
    } else {
      res.status(500).json({ error: '更新任务失败' })
    }
  }
})

// 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await db.deleteTask(id)

    res.json({ message: '任务删除成功' })
  } catch (error) {
    console.error('删除任务错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '任务不存在' })
    } else {
      res.status(500).json({ error: '删除任务失败' })
    }
  }
})

export default router
