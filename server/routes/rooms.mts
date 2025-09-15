import { Router } from 'express'
import { DatabaseService } from '../services/database.mjs'
import { sendUserJoined, sendUserLeft } from './events.mjs'
import { logger, logError } from '../services/logging.mjs'

const router = Router()
const db = new DatabaseService()

// 创建房间
router.post('/', async (req, res) => {
  const { name, ownerId } = req.body

  try {
    if (!name || !ownerId) {
      logger.warn('Create room validation failed', { name: !!name, ownerId: !!ownerId })
      return res.status(400).json({ error: '房间名称和房主ID为必填项' })
    }

    const code = await db.generateUniqueRoomCode()
    const room = await db.createRoom({
      name,
      code,
      owner: ownerId,
      participants: [ownerId], // 房主自动加入
    })

    logger.info('Room created successfully', { roomId: room.id, code: room.code, ownerId })

    res.status(201).json({
      id: room.id,
      name: room.name,
      code: room.code,
      owner: room.owner,
      created: room.created,
    })
  } catch (error) {
    logError('Create room failed', error, { name, ownerId })
    res.status(500).json({ error: '创建房间失败' })
  }
})

// 通过房间码获取房间
router.get('/code/:code', async (req, res) => {
  const { code } = req.params

  try {
    const room = await db.getRoomByCode(code)
    if (!room) {
      logger.warn('Room not found by code', { code })
      return res.status(404).json({ error: '房间不存在' })
    }

    // 获取完整房间信息（包含扩展信息）
    const fullRoom = await db.getRoomById(room.id)

    logger.debug('Room retrieved by code', { roomId: fullRoom.id, code })

    res.json({
      id: fullRoom.id,
      name: fullRoom.name,
      code: fullRoom.code,
      owner: fullRoom.owner,
      participants: fullRoom.expand.participants,
      created: fullRoom.created,
    })
  } catch (error) {
    logError('Get room by code failed', error, { code })
    res.status(500).json({ error: '获取房间信息失败' })
  }
})

// 通过ID获取房间
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const room = await db.getRoomById(id)

    logger.debug('Room retrieved by id', { roomId: id })

    res.json({
      id: room.id,
      name: room.name,
      code: room.code,
      owner: room.owner,
      participants: room.expand.participants,
      created: room.created,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      logger.warn('Room not found by id', { roomId: id })
      res.status(404).json({ error: '房间不存在' })
    } else {
      logError('Get room by id failed', error, { roomId: id })
      res.status(500).json({ error: '获取房间信息失败' })
    }
  }
})

// 获取用户的所有房间
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const rooms = await db.getUserRooms(userId)

    logger.debug('User rooms retrieved', { userId, roomCount: rooms.length })

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
    logError('Get user rooms failed', error, { userId })
    res.status(500).json({ error: '获取用户房间失败' })
  }
})

// 添加用户到房间
router.post('/:id/participants', async (req, res) => {
  const { id } = req.params
  const { userId } = req.body

  try {
    if (!userId) {
      logger.warn('Add user to room validation failed', { roomId: id, userId: !!userId })
      return res.status(400).json({ error: '用户ID为必填项' })
    }

    const room = await db.addUserToRoom(id, userId)

    // 发送用户加入事件
    const user = await db.getUserById(userId)
    if (user) {
      sendUserJoined(id, userId, user.name)
    }

    logger.info('User added to room', {
      roomId: id,
      userId,
      participantCount: room.participants.length,
    })

    res.json({
      id: room.id,
      participants: room.participants,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      logger.warn('Room not found when adding user', { roomId: id, userId })
      res.status(404).json({ error: '房间不存在' })
    } else {
      logError('Add user to room failed', error, { roomId: id, userId })
      res.status(500).json({ error: '添加用户到房间失败' })
    }
  }
})

// 从房间移除用户
router.delete('/:id/participants/:userId', async (req, res) => {
  const { id, userId } = req.params

  try {
    const room = await db.removeUserFromRoom(id, userId)

    // 发送用户离开事件
    const user = await db.getUserById(userId)
    if (user) {
      sendUserLeft(id, userId, user.name)
    }

    logger.info('User removed from room', {
      roomId: id,
      userId,
      participantCount: room.participants.length,
    })

    res.json({
      id: room.id,
      participants: room.participants,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      logger.warn('Room not found when removing user', { roomId: id, userId })
      res.status(404).json({ error: '房间不存在' })
    } else {
      logError('Remove user from room failed', error, { roomId: id, userId })
      res.status(500).json({ error: '移除用户失败' })
    }
  }
})

export default router
