import { Router } from 'express'
import { DatabaseService } from '../services/database.mjs'
import { nanoid } from 'nanoid'

const router = Router()
const db = new DatabaseService()

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body

    if (!email || !name || !password) {
      return res.status(400).json({ error: '邮箱、姓名和密码为必填项' })
    }

    // 检查邮箱是否已存在
    const existingUser = await db.getUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ error: '邮箱已被注册' })
    }

    const user = await db.createUser({ email, name, password, passwordConfirm: password })
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ error: '注册失败' })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码为必填项' })
    }

    const authResponse = await db.authenticateUser(email, password)
    const user = authResponse.record

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      token: authResponse.token,
    })
  } catch (error) {
    console.error('登录错误:', error)
    if (error instanceof Error && error.message.includes('Invalid credentials')) {
      res.status(401).json({ error: '邮箱或密码错误' })
    } else {
      res.status(500).json({ error: '登录失败' })
    }
  }
})

// 创建游客账户
router.post('/guest', async (req, res) => {
  try {
    const { name } = req.body
    const randomString = nanoid(12)
    const guestEmail = `${randomString}@guest.com`
    const guestPassword = randomString

    const user = await db.createGuestUser(name || `Guest ${randomString.slice(0, 4)}`, guestEmail, guestPassword)

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      password: guestPassword, // 返回给前端存储
      isGuest: true,
    })
  } catch (error) {
    console.error('创建游客错误:', error)
    res.status(500).json({ error: '创建游客账户失败' })
  }
})

export default router
