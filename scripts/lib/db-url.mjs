// DATABASE_URL from the environment, else from .env.local (scripts run outside Next, which loads it otherwise)
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

export function databaseUrl(root) {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const envFile = path.join(root, '.env.local')
  if (existsSync(envFile)) {
    const line = readFileSync(envFile, 'utf8').split(/\r?\n/).find(l => l.startsWith('DATABASE_URL='))
    if (line) return line.slice('DATABASE_URL='.length).trim()
  }
  throw new Error('DATABASE_URL is not set (copy .env.example to .env.local)')
}
