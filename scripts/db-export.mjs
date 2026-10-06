// Write the database atlas back into the static snapshot used in production:
//   lib/continent-meta.json     continents (order, tagline, image, top 5)
//   lib/world-universities.json countries and universities per continent
//   lib/country-costs.json      tuition notes
//   public/logos/uploads/       logos uploaded in admin (served from the DB in dev)
//
//   npm run db:export                      export; fails if the database can't be reached
//   node scripts/db-export.mjs --if-available
//       used by `npm run build` (prebuild): skips with a warning when the database is down,
//       so the build uses the snapshot already in lib/
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pg from 'pg'
import { databaseUrl } from './lib/db-url.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ifAvailable = process.argv.includes('--if-available')
const UPLOAD_DIR = path.join(root, 'public', 'logos', 'uploads')
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }

// Write only when the content changed, so unchanged files keep clean git diffs
function writeIfChanged(file, content) {
  const full = path.join(root, file)
  if (existsSync(full) && readFileSync(full, 'utf8') === content) return false
  writeFileSync(full, content)
  return true
}
const json = value => JSON.stringify(value, null, 2) + '\n'

// During a build (--if-available) a missing or unusable database must never fail the build:
// warn and keep the snapshot already in lib/. A manual `npm run db:export` fails loudly instead.
function skipOrFail(reason, hint) {
  const message = `${reason}; the static snapshot in lib/ was not updated.`
  if (ifAvailable) {
    console.warn(`db-export: ${message} Building with the existing snapshot.`)
    process.exit(0)
  }
  console.error(`db-export: ${message} ${hint}`)
  process.exit(1)
}

let client
try {
  client = new pg.Client({ connectionString: databaseUrl(root), connectionTimeoutMillis: 3000 })
  await client.connect()
} catch (err) {
  if (err.message.startsWith('DATABASE_URL')) skipOrFail('DATABASE_URL is not set', 'Copy .env.example to .env.local.')
  skipOrFail(`Database not reachable (${err.code ?? err.message})`, 'Start it with npm run db:up.')
}

try {
  // One client, so the queries run one after another
  const continents = await client.query('SELECT id, name, tagline, image_url FROM continents ORDER BY sort_order, name')
  const countries = await client.query('SELECT id, continent_id, name, cost FROM countries ORDER BY sort_order, name')
  const universities = await client.query('SELECT id, country_id, name, logo, website FROM universities ORDER BY sort_order, name')
  const tops = await client.query(`SELECT t.continent_id, u.name FROM continent_top t JOIN universities u ON u.id = t.university_id
                                   ORDER BY t.continent_id, t.position`)
  if (continents.rowCount === 0) {
    // An empty database would wipe the snapshot; that is never what a build wants
    await client.end()
    skipOrFail('The database has no continents (not seeded?)', 'Run npm run db:seed.')
  }

  // Uploaded logos live in the database; copy them to files the static site can serve
  mkdirSync(UPLOAD_DIR, { recursive: true })
  const uploadIds = [...new Set(universities.rows
    .map(u => /^\/api\/uploads\/(\d+)$/.exec(u.logo ?? '')?.[1])
    .filter(Boolean)
    .map(Number))]
  const uploadPath = new Map()
  if (uploadIds.length) {
    const { rows } = await client.query('SELECT id, content_type, data FROM uploads WHERE id = ANY($1::int[])', [uploadIds])
    for (const r of rows) {
      const name = `${r.id}.${EXT[r.content_type] ?? 'img'}`
      const file = path.join(UPLOAD_DIR, name)
      if (!existsSync(file) || !readFileSync(file).equals(r.data)) writeFileSync(file, r.data)
      uploadPath.set(`/api/uploads/${r.id}`, `/logos/uploads/${name}`)
    }
  }
  // Remove exported uploads no university uses any more
  const keep = new Set([...uploadPath.values()].map(p => path.basename(p)))
  let pruned = 0
  for (const f of readdirSync(UPLOAD_DIR)) {
    if (!keep.has(f)) { rmSync(path.join(UPLOAD_DIR, f)); pruned++ }
  }

  const unisByCountry = new Map()
  for (const u of universities.rows) {
    const entry = { name: u.name }
    const logo = u.logo ? (uploadPath.get(u.logo) ?? u.logo) : null
    if (logo?.startsWith('/api/uploads/')) {
      console.warn(`db-export: upload for “${u.name}” is missing; exporting it without a logo.`)
    } else if (logo) {
      entry.logo = logo
    }
    if (u.website) entry.website = u.website
    if (!unisByCountry.has(u.country_id)) unisByCountry.set(u.country_id, [])
    unisByCountry.get(u.country_id).push(entry)
  }

  const meta = continents.rows.map(c => ({
    id: c.id,
    name: c.name,
    tagline: c.tagline,
    imageUrl: c.image_url,
    top: tops.rows.filter(t => t.continent_id === c.id).map(t => t.name),
  }))
  const world = Object.fromEntries(continents.rows.map(c => [
    c.name,
    countries.rows.filter(k => k.continent_id === c.id)
      .map(k => ({ name: k.name, universities: unisByCountry.get(k.id) ?? [] })),
  ]))
  const costs = Object.fromEntries(countries.rows.filter(k => k.cost).map(k => [k.name, k.cost]))

  const changed = [
    writeIfChanged('lib/continent-meta.json', json(meta)) && 'continent-meta.json',
    writeIfChanged('lib/world-universities.json', json(world)) && 'world-universities.json',
    writeIfChanged('lib/country-costs.json', json(costs)) && 'country-costs.json',
  ].filter(Boolean)

  console.log(
    `db-export: ${continents.rowCount} continents, ${countries.rowCount} countries, ${universities.rowCount} universities, `
    + `${uploadPath.size} uploaded logos. `
    + (changed.length ? `Updated ${changed.join(', ')}.` : 'Static snapshot already up to date.')
    + (pruned ? ` Removed ${pruned} unused uploaded logo file(s).` : ''))
} catch (err) {
  // e.g. tables missing because the schema was never applied to this database
  await client.end().catch(() => {})
  skipOrFail(`Export failed: ${err.message}`, 'Check the database with npm run db:psql, or reseed it.')
} finally {
  await client.end()
}
