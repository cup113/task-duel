import { Router } from 'express'
import { DatabaseService } from '../services/database.mjs'
import { sendUserJoined, sendUserLeft } from './events.mjs'

const router = Router()
const db = new DatabaseService()

// 创建房间
router.post('/', async (req, res) => {
  try {
    const { name, ownerId } = req.body

    if (!name || !ownerId) {
      return res.status(400).json({ error: '房间名称和房主ID为必填项' })
    }

    const code = await db.generateUniqueRoomCode()
    const room = await db.createRoom({
      name,
      code,
      owner: ownerId,
      participants: [ownerId], // 房主自动加入
    })

    res.status(201).json({
      id: room.id,
      name: room.name,
      code: room.code,
      owner: room.owner,
      created: room.created,
    })
  } catch (error) {
    console.error('创建房间错误:', error)
    res.status(500).json({ error: '创建房间失败' })
  }
})

// 通过房间码获取房间
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params

    const room = await db.getRoomByCode(code)
    if (!room) {
      return res.status(404).json({ error: '房间不存在' })
    }

    // 获取完整房间信息（包含扩展信息）
    const fullRoom = await db.getRoomById(room.id)

    res.json({
      id: fullRoom.id,
      name: fullRoom.name,
      code: fullRoom.code,
      owner: fullRoom.owner,
      participants: fullRoom.expand.participants,
      created: fullRoom.created,
    })
  } catch (error) {
    console.error('获取房间错误:', error)
    res.status(500).json({ error: '获取房间信息失败' })
  }
})

// 通过ID获取房间
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const room = await db.getRoomById(id)

    res.json({
      id: room.id,
      name: room.name,
      code: room.code,
      owner: room.owner,
      participants: room.expand.participants,
      created: room.created,
    })
  } catch (error) {
    console.error('获取房间错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '房间不存在' })
    } else {
      res.status(500).json({ error: '获取房间信息失败' })
    }
  }
})

// 获取用户的所有房间
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const rooms = await db.getUserRooms(userId)

    res.json(
      rooms.map((room) => ({
        id: room.id,
        name: room.name,
        code: room.code,
        owner: room.owner,
        created: room.created,
      })),
    )
  } catch (error) {
    console.error('获取用户房间错误:', error)
    res.status(500).json({ error: '获取用户房间失败' })
  }
})

// 添加用户到房间
router.post('/:id/participants', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: '用户ID为必填项' })
    }

    const room = await db.addUserToRoom(id, userId)

    // 发送用户加入事件
    const user = await db.getUserById(userId)
    if (user) {
      sendUserJoined(id, userId, user.name)
    }

    res.json({
      id: room.id,
      participants: room.participants,
    })
  } catch (error) {
    console.error('添加用户到房间错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '房间不存在' })
    } else {
      res.status(500).json({ error: '添加用户到房间失败' })
    }
  }
})

// 从房间移除用户
router.delete('/:id/participants/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params

    const room = await db.removeUserFromRoom(id, userId)

    // 发送用户离开事件
    const user = await db.getUserById(userId)
    if (user) {
      sendUserLeft(id, userId, user.name)
    }

    res.json({
      id: room.id,
      participants: room.participants,
    })
  } catch (error) {
    console.error('移除用户错误:', error)
    if (error instanceof Error && error.message.includes('404')) {
      res.status(404).json({ error: '房间不存在' })
    } else {
      res.status(500).json({ error: '移除用户失败' })
    }
  }
})

export default router
