import pg from 'pg'
import { env } from '../config/env.config.js'

const { Pool } = pg

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

pool.on('error', (err) => {
  console.error('Database error:', err)
})
