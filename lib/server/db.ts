import 'server-only'
import { Pool, type PoolClient } from 'pg'

// One pool per server process; cached on globalThis so dev hot-reloads don't open new pools
const globalForPg = globalThis as unknown as { pgPool?: Pool }

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 3000,
  })

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    throw err
  } finally {
    client.release()
  }
}
