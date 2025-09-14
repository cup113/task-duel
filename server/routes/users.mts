import { Router } from 'express'
import { DatabaseService } from '../services/database.mjs'

const router = Router()
const db = new DatabaseService()

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const user = await db.getUserById(id)

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      created: user.created,
    })
  } catch (error) {
    console.error('获取用户错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '用户不存在' })
    } else {
      res.status(500).json({ error: '获取用户信息失败' })
    }
  }
})

// 批量获取用户信息
router.post('/batch', async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '用户ID列表为必填项' })
    }

    const users = await Promise.all(
      ids.map(async (id) => {
        try {
          const user = await db.getUserById(id)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            created: user.created,
          }
        } catch (error) {
          // 如果用户不存在，返回null
          return null
        }
      }),
    )

    // 过滤掉不存在的用户
    const validUsers = users.filter((user): user is NonNullable<typeof user> => user !== null)

    res.json(validUsers)
  } catch (error) {
    console.error('批量获取用户错误:', error)
    res.status(500).json({ error: '批量获取用户信息失败' })
  }
})

// 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email } = req.body

    if (!name && !email) {
      return res.status(400).json({ error: '至少提供一个更新字段' })
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email

    const user = await db.updateUser(id, updateData)

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      updated: user.updated,
    })
  } catch (error) {
    console.error('更新用户错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '用户不存在' })
    } else {
      res.status(500).json({ error: '更新用户信息失败' })
    }
  }
})

export default router
