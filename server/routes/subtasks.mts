import { Router } from 'express'
import { DatabaseService } from '../services/database.mjs'
import { sendSubtasksCreated } from './events.mjs'

const router = Router()
const db = new DatabaseService()

// 解析子任务文本（支持"3~8"格式）
function parseSubtaskText(text: string): string[] {
  const results: string[] = []

  // 处理范围格式 "3~8"
  const rangeMatch = text.match(/^(\d+)~(\d+)$/)
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1])
    const end = parseInt(rangeMatch[2])

    if (start <= end) {
      for (let i = start; i <= end; i++) {
        results.push(i.toString())
      }
    }
    return results
  }

  // 处理单个数字或普通文本
  results.push(text)
  return results
}

// 批量创建子任务
router.post('/batch', async (req, res) => {
  try {
    const { taskId, subtasks: subtaskTexts } = req.body

    if (!taskId || !subtaskTexts || !Array.isArray(subtaskTexts)) {
      return res.status(400).json({ error: '任务ID和子任务列表为必填项' })
    }

    // 解析所有子任务文本
    const parsedSubtasks: { title: string; task: string; order: number }[] = []
    let order = 1

    for (const text of subtaskTexts) {
      const titles = parseSubtaskText(text.trim())
      for (const title of titles) {
        parsedSubtasks.push({
          title,
          task: taskId,
          order: order++,
        })
      }
    }

    if (parsedSubtasks.length === 0) {
      return res.status(400).json({ error: '没有有效的子任务' })
    }

    const createdSubtasks = await db.createSubtasks(parsedSubtasks)

    // 发送子任务创建事件
    const task = await db.getTaskById(taskId)
    if (task) {
      sendSubtasksCreated(task.room, taskId, createdSubtasks.length)
    }

    res.status(201).json(
      createdSubtasks.map((subtask) => ({
        id: subtask.id,
        title: subtask.title,
        task: subtask.task,
        order: subtask.order,
        created: subtask.created,
      })),
    )
  } catch (error) {
    console.error('批量创建子任务错误:', error)
    res.status(500).json({ error: '批量创建子任务失败' })
  }
})

// 获取任务的所有子任务
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params

    const subtasks = await db.getTaskSubtasks(taskId)

    res.json(
      subtasks.map((subtask) => ({
        id: subtask.id,
        title: subtask.title,
        task: subtask.task,
        order: subtask.order,
        created: subtask.created,
        updated: subtask.updated,
      })),
    )
  } catch (error) {
    console.error('获取子任务错误:', error)
    res.status(500).json({ error: '获取子任务列表失败' })
  }
})

// 获取子任务详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const subtask = await db.getSubtaskById(id)

    res.json({
      id: subtask.id,
      title: subtask.title,
      task: subtask.task,
      order: subtask.order,
      created: subtask.created,
      updated: subtask.updated,
    })
  } catch (error) {
    console.error('获取子任务错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '子任务不存在' })
    } else {
      res.status(500).json({ error: '获取子任务信息失败' })
    }
  }
})

// 更新子任务
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, order } = req.body

    if (!title && order === undefined) {
      return res.status(400).json({ error: '至少提供一个更新字段' })
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (order !== undefined) updateData.order = order

    const subtask = await db.updateSubtask(id, updateData)

    res.json({
      id: subtask.id,
      title: subtask.title,
      task: subtask.task,
      order: subtask.order,
      updated: subtask.updated,
    })
  } catch (error) {
    console.error('更新子任务错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '子任务不存在' })
    } else {
      res.status(500).json({ error: '更新子任务失败' })
    }
  }
})

// 删除子任务
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await db.deleteSubtask(id)

    res.json({ message: '子任务删除成功' })
  } catch (error) {
    console.error('删除子任务错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '子任务不存在' })
    } else {
      res.status(500).json({ error: '删除子任务失败' })
    }
  }
})

export default router
