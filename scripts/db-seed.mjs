// Load the spreadsheet-generated atlas into PostgreSQL.
//
//   npm run db:seed            seed an empty database (refuses if data already exists)
//   npm run db:seed -- --force wipe the masters and reseed (the activity log is kept)
//
// Reads DATABASE_URL from the environment or .env.local.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pg from 'pg'
import { databaseUrl } from './lib/db-url.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const readJson = file => JSON.parse(readFileSync(path.join(root, file), 'utf8'))

const force = process.argv.includes('--force')
const meta = readJson('lib/continent-meta.json')
const world = readJson('lib/world-universities.json')
const costs = readJson('lib/country-costs.json')

const client = new pg.Client({ connectionString: databaseUrl(root) })
await client.connect()
try {
  await client.query(readFileSync(path.join(root, 'db/schema.sql'), 'utf8'))

  const { rows: [{ count }] } = await client.query('SELECT count(*)::int AS count FROM continents')
  if (count > 0 && !force) {
    console.log(`Database already has ${count} continents; nothing to do. Use --force to wipe and reseed.`)
    process.exit(0)
  }

  await client.query('BEGIN')
  if (count > 0) await client.query('TRUNCATE continent_top, universities, countries, continents RESTART IDENTITY CASCADE')

  let countryTotal = 0
  let universityTotal = 0
  for (const [ci, c] of meta.entries()) {
    await client.query(
      'INSERT INTO continents (id, name, tagline, image_url, sort_order) VALUES ($1, $2, $3, $4, $5)',
      [c.id, c.name, c.tagline, c.imageUrl, ci])
    const universityIds = new Map()
    for (const [ki, k] of (world[c.name] ?? []).entries()) {
      const { rows: [country] } = await client.query(
        'INSERT INTO countries (continent_id, name, cost, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
        [c.id, k.name, costs[k.name] ?? null, ki])
      countryTotal++
      for (const [ui, u] of k.universities.entries()) {
        const { rows: [uni] } = await client.query(
          'INSERT INTO universities (country_id, name, logo, website, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [country.id, u.name, u.logo ?? null, u.website ?? null, ui])
        universityIds.set(u.name, uni.id)
        universityTotal++
      }
    }
    for (const [ti, name] of c.top.entries()) {
      const id = universityIds.get(name)
      if (id) await client.query('INSERT INTO continent_top (continent_id, position, university_id) VALUES ($1, $2, $3)', [c.id, ti + 1, id])
      else console.warn(`warning: top university “${name}” not found in ${c.name}`)
    }
  }

  const summary = `Loaded ${meta.length} continents, ${countryTotal} countries and ${universityTotal} universities from the spreadsheet`
  await client.query(
    `INSERT INTO activity_log (actor, action, entity, summary) VALUES ('system (db-seed)', 'seed', 'atlas', $1)`,
    [force && count > 0 ? `${summary} (reseeded, replacing existing data)` : summary])
  await client.query('COMMIT')
  console.log(summary)
} catch (err) {
  await client.query('ROLLBACK').catch(() => {})
  console.error(err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
