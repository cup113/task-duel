import { Router } from 'express'
import authRouter from './auth.mjs'
import usersRouter from './users.mjs'
import roomsRouter from './rooms.mjs'
import tasksRouter from './tasks.mjs'
import subtasksRouter from './subtasks.mjs'
import completionRouter from './completion.mjs'
import eventsRouter, {
  sendSubtaskProgressUpdated,
  sendUserJoined,
  sendUserLeft,
  sendTaskCreated,
  sendSubtasksCreated,
} from './events.mjs'

const router = Router()

// API路由
router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/rooms', roomsRouter)
router.use('/tasks', tasksRouter)
router.use('/subtasks', subtasksRouter)
router.use('/completion', completionRouter)
router.use('/events', eventsRouter)

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

export default router

export {
  sendSubtaskProgressUpdated,
  sendUserJoined,
  sendUserLeft,
  sendTaskCreated,
  sendSubtasksCreated,
}
