import winston from 'winston'
import { env } from 'process'

// 日志级别配置
const logLevel = env['LOG_LEVEL'] || 'info'

// 创建logger实例
export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'task-duel-server' },
  transports: [
    // 控制台输出（开发环境）
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    // 文件输出（生产环境）
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
})

// 如果不在生产环境，添加更详细的调试日志
if (env['NODE_ENV'] !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      level: "debug"
    }),
  )
}

// 请求日志中间件
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    }

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData)
    } else {
      logger.info('HTTP Request', logData)
    }
  })

  next()
}

// 错误日志辅助函数
export const logError = (message: string, error: any, context?: any) => {
  logger.error(message, {
    error: error.message,
    stack: error.stack,
    ...context,
  })
}

// 数据库操作日志
export async function logWithDbOperation<T>(operation: string, call: () => Promise<T>, data: any): Promise<T> {
  try {
    const result = await call()
    logger.debug('Database Operation', { operation, data })
    return result
  } catch (error) {
    logger.error('Database Operation Failed', { operation, data, error })
    throw error
  }
}

// 业务事件日志
export const logBusinessEvent = (event: string, data: any) => {
  logger.info('Business Event', { event, ...data })
}
