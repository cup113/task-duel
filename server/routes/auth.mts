import { Router } from 'express'
import { DatabaseService } from '../services/database.mjs'
import { nanoid } from 'nanoid'
import { logger, logError } from '../services/logging.mjs'

const router = Router()
const db = new DatabaseService()

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body

    if (!email || !name || !password) {
      logger.warn('Register validation failed', { email, name: !!name, password: !!password })
      return res.status(400).json({ error: '邮箱、姓名和密码为必填项' })
    }

    const user = await db.createUser({ email, name, password, passwordConfirm: password })

    logger.info('User registered successfully', { userId: user.id, email: user.email })

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    logError('Register failed', error, { email: req.body.email })
    res.status(500).json({ error: '注册失败' })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      logger.warn('Login validation failed', { email: !!email, password: !!password })
      return res.status(400).json({ error: '邮箱和密码为必填项' })
    }

    const authResponse = await db.authenticateUser(email, password)
    const user = authResponse.record

    logger.info('User logged in successfully', { userId: user.id, email: user.email })

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      token: authResponse.token,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid credentials')) {
      logger.warn('Login failed: invalid credentials', { email: req.body.email })
      res.status(401).json({ error: '邮箱或密码错误' })
    } else {
      logError('Login failed', error, { email: req.body.email })
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

    const user = await db.createGuestUser(
      name || `Guest ${randomString.slice(0, 4)}`,
      guestEmail,
      guestPassword,
    )

    logger.info('Guest user created', { userId: user.id, name: user.name })

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      password: guestPassword, // 返回给前端存储
      isGuest: true,
    })
  } catch (error) {
    logError('Create guest user failed', error, { name })
    res.status(500).json({ error: '创建游客账户失败' })
  }
})

export default router
