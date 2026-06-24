import { env } from './env.config.js'

export const corsOptions = {
  origin: env.CLIENT_URL,
  credentials: true,
}

export const socketOptions = {
  cors: corsOptions,
}

export const rateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
}
