import 'server-only'
import type { PoolClient } from 'pg'
import { pool, withTransaction } from '@/lib/server/db'
import type { ActivityAction, ActivityEntity, ActivityEntry, Continent } from '@/types'

/* ─── Errors the API turns into 4xx responses ────────────────────────────── */

export class InputError extends Error { status = 400 }
export class NotFoundError extends Error { status = 404 }

const UNIQUE_VIOLATION = '23505'
const isUniqueViolation = (err: unknown) => (err as { code?: string })?.code === UNIQUE_VIOLATION

/* ─── Reading ────────────────────────────────────────────────────────────── */

export async function getAtlas(): Promise<Continent[]> {
  const [continents, countries, universities, tops] = await Promise.all([
    pool.query('SELECT id, name, tagline, image_url FROM continents ORDER BY sort_order, name'),
    pool.query('SELECT id, continent_id, name, cost FROM countries ORDER BY sort_order, name'),
    pool.query('SELECT id, country_id, name, logo, website FROM universities ORDER BY sort_order, name'),
    pool.query(`SELECT t.continent_id, t.university_id, u.name
                FROM continent_top t JOIN universities u ON u.id = t.university_id
                ORDER BY t.continent_id, t.position`),
  ])

  const unisByCountry = new Map<number, Continent['countries'][number]['universities']>()
  for (const u of universities.rows) {
    const list = unisByCountry.get(u.country_id) ?? []
    list.push({ id: u.id, name: u.name, ...(u.logo ? { logo: u.logo } : {}), ...(u.website ? { website: u.website } : {}) })
    unisByCountry.set(u.country_id, list)
  }

  return continents.rows.map(c => {
    const top = tops.rows.filter(t => t.continent_id === c.id)
    return {
      id: c.id,
      name: c.name,
      tagline: c.tagline,
      imageUrl: c.image_url,
      top: top.map(t => t.name),
      topIds: top.map(t => t.university_id),
      countries: countries.rows
        .filter(k => k.continent_id === c.id)
        .map(k => ({
          id: k.id,
          name: k.name,
          universities: unisByCountry.get(k.id) ?? [],
          ...(k.cost ? { cost: k.cost } : {}),
        })),
    }
  })
}

export async function listActivity(opts: {
  entity?: string; action?: string; limit: number; beforeId?: number
}): Promise<ActivityEntry[]> {
  const where: string[] = []
  const params: unknown[] = []
  if (opts.entity) { params.push(opts.entity); where.push(`entity = $${params.length}`) }
  if (opts.action) { params.push(opts.action); where.push(`action = $${params.length}`) }
  if (opts.beforeId) { params.push(opts.beforeId); where.push(`id < $${params.length}`) }
  params.push(opts.limit)
  const { rows } = await pool.query(
    `SELECT id, occurred_at, actor, action, entity, entity_id, summary, changes FROM activity_log
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY id DESC LIMIT $${params.length}`,
    params)
  return rows.map(r => ({
    id: Number(r.id),
    occurredAt: r.occurred_at.toISOString(),
    actor: r.actor,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id,
    summary: r.summary,
    changes: r.changes,
  }))
}

/* ─── Activity log helpers ───────────────────────────────────────────────── */

async function log(
  client: PoolClient, actor: string, action: ActivityAction, entity: ActivityEntity,
  entityId: string | number, summary: string, changes: Record<string, unknown> | null,
) {
  await client.query(
    'INSERT INTO activity_log (actor, action, entity, entity_id, summary, changes) VALUES ($1, $2, $3, $4, $5, $6)',
    [actor, action, entity, String(entityId), summary, changes ? JSON.stringify(changes) : null])
}

// {field: {from, to}} for the fields that actually changed
function diff(before: Record<string, unknown>, after: Record<string, unknown>) {
  const out: Record<string, { from: unknown; to: unknown }> = {}
  for (const key of Object.keys(after)) {
    if (JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null)) {
      out[key] = { from: before[key] ?? null, to: after[key] ?? null }
    }
  }
  return out
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : word.endsWith('y') ? '' : 's'}`
  .replace(/y$/, n === 1 ? 'y' : 'ies')

/* ─── Input cleaning ─────────────────────────────────────────────────────── */

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const optional = (v: unknown) => text(v) || null
const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s)

function requireName(v: unknown, what: string) {
  const name = text(v)
  if (!name) throw new InputError(`${what} name is required.`)
  if (name.length > 200) throw new InputError(`${what} name is too long.`)
  return name
}

const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function nextSortOrder(client: PoolClient, table: string, column?: string, value?: unknown) {
  const { rows: [r] } = await client.query(
    `SELECT COALESCE(MAX(sort_order) + 1, 0) AS n FROM ${table}${column ? ` WHERE ${column} = $1` : ''}`,
    column ? [value] : [])
  return r.n as number
}

/* ─── Continents ─────────────────────────────────────────────────────────── */

export async function createContinent(input: Record<string, unknown>, actor: string) {
  const name = requireName(input.name, 'Continent')
  const record = { name, tagline: text(input.tagline), imageUrl: text(input.imageUrl) }
  return withTransaction(async client => {
    let id = slugify(name) || 'region'
    while ((await client.query('SELECT 1 FROM continents WHERE id = $1', [id])).rowCount) id += '-2'
    try {
      await client.query(
        'INSERT INTO continents (id, name, tagline, image_url, sort_order) VALUES ($1, $2, $3, $4, $5)',
        [id, record.name, record.tagline, record.imageUrl, await nextSortOrder(client, 'continents')])
    } catch (err) {
      if (isUniqueViolation(err)) throw new InputError(`A continent named “${name}” already exists.`)
      throw err
    }
    await log(client, actor, 'create', 'continent', id, `Added continent ${name}`, record)
    return { id }
  })
}

export async function updateContinent(id: string, input: Record<string, unknown>, actor: string) {
  const name = requireName(input.name, 'Continent')
  return withTransaction(async client => {
    const { rows: [before] } = await client.query('SELECT name, tagline, image_url FROM continents WHERE id = $1 FOR UPDATE', [id])
    if (!before) throw new NotFoundError('Continent not found.')
    const after = { name, tagline: text(input.tagline), imageUrl: text(input.imageUrl) }
    try {
      await client.query('UPDATE continents SET name = $2, tagline = $3, image_url = $4, updated_at = now() WHERE id = $1',
        [id, after.name, after.tagline, after.imageUrl])
    } catch (err) {
      if (isUniqueViolation(err)) throw new InputError(`A continent named “${name}” already exists.`)
      throw err
    }

    // Top 5: university ids in order; each must belong to this continent
    const changes: Record<string, unknown> = diff({ name: before.name, tagline: before.tagline, imageUrl: before.image_url }, after)
    if (Array.isArray(input.topIds)) {
      const topIds = input.topIds.map(Number)
        .filter((n, i, all) => Number.isInteger(n) && n > 0 && all.indexOf(n) === i).slice(0, 5)
      const { rows: valid } = await client.query(
        `SELECT u.id, u.name FROM universities u JOIN countries k ON k.id = u.country_id
         WHERE k.continent_id = $1 AND u.id = ANY($2::int[])`, [id, topIds])
      if (valid.length !== topIds.length) throw new InputError('Top universities must belong to this continent.')
      const { rows: oldTop } = await client.query(
        `SELECT u.name FROM continent_top t JOIN universities u ON u.id = t.university_id
         WHERE t.continent_id = $1 ORDER BY t.position`, [id])
      await client.query('DELETE FROM continent_top WHERE continent_id = $1', [id])
      for (let i = 0; i < topIds.length; i++) {
        await client.query('INSERT INTO continent_top (continent_id, position, university_id) VALUES ($1, $2, $3)', [id, i + 1, topIds[i]])
      }
      const nameOf = new Map(valid.map(v => [v.id, v.name]))
      Object.assign(changes, diff({ top: oldTop.map(t => t.name) }, { top: topIds.map(t => nameOf.get(t)) }))
    }

    if (Object.keys(changes).length) {
      await log(client, actor, 'update', 'continent', id, `Updated continent ${name}`, changes)
    }
    return { id }
  })
}

export async function deleteContinent(id: string, actor: string) {
  return withTransaction(async client => {
    const { rows: [c] } = await client.query(
      `SELECT c.name, c.tagline, c.image_url,
         (SELECT count(*)::int FROM countries k WHERE k.continent_id = c.id) AS countries,
         (SELECT count(*)::int FROM universities u JOIN countries k ON k.id = u.country_id WHERE k.continent_id = c.id) AS universities
       FROM continents c WHERE c.id = $1 FOR UPDATE`, [id])
    if (!c) throw new NotFoundError('Continent not found.')
    await client.query('DELETE FROM continents WHERE id = $1', [id])
    await log(client, actor, 'delete', 'continent', id,
      `Deleted continent ${c.name} with ${plural(c.countries, 'country')} and ${plural(c.universities, 'university')}`,
      { name: c.name, tagline: c.tagline, imageUrl: c.image_url, countries: c.countries, universities: c.universities })
    return { id }
  })
}

/* ─── Countries ──────────────────────────────────────────────────────────── */

async function requireContinent(client: PoolClient, id: unknown) {
  const { rows: [c] } = await client.query('SELECT id, name FROM continents WHERE id = $1', [text(id)])
  if (!c) throw new InputError('Choose a continent.')
  return c as { id: string; name: string }
}

export async function createCountry(input: Record<string, unknown>, actor: string) {
  const name = requireName(input.name, 'Country')
  return withTransaction(async client => {
    const continent = await requireContinent(client, input.continentId)
    const cost = optional(input.cost)
    let id: number
    try {
      const { rows: [r] } = await client.query(
        'INSERT INTO countries (continent_id, name, cost, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
        [continent.id, name, cost, await nextSortOrder(client, 'countries', 'continent_id', continent.id)])
      id = r.id
    } catch (err) {
      if (isUniqueViolation(err)) throw new InputError(`A country named “${name}” already exists.`)
      throw err
    }
    await log(client, actor, 'create', 'country', id, `Added country ${name} to ${continent.name}`,
      { name, continent: continent.name, cost })
    return { id }
  })
}

export async function updateCountry(id: number, input: Record<string, unknown>, actor: string) {
  const name = requireName(input.name, 'Country')
  return withTransaction(async client => {
    const { rows: [before] } = await client.query(
      `SELECT k.name, k.cost, k.continent_id, c.name AS continent FROM countries k
       JOIN continents c ON c.id = k.continent_id WHERE k.id = $1 FOR UPDATE OF k`, [id])
    if (!before) throw new NotFoundError('Country not found.')
    const continent = await requireContinent(client, input.continentId)
    const cost = optional(input.cost)
    const moved = continent.id !== before.continent_id
    try {
      await client.query(
        `UPDATE countries SET name = $2, cost = $3, continent_id = $4, updated_at = now(),
           sort_order = CASE WHEN $5 THEN $6 ELSE sort_order END WHERE id = $1`,
        [id, name, cost, continent.id, moved, moved ? await nextSortOrder(client, 'countries', 'continent_id', continent.id) : 0])
    } catch (err) {
      if (isUniqueViolation(err)) throw new InputError(`A country named “${name}” already exists.`)
      throw err
    }
    // Its universities can't stay in the old continent's top 5
    if (moved) {
      await client.query(
        'DELETE FROM continent_top WHERE continent_id = $1 AND university_id IN (SELECT id FROM universities WHERE country_id = $2)',
        [before.continent_id, id])
    }
    const changes = diff({ name: before.name, cost: before.cost, continent: before.continent },
      { name, cost, continent: continent.name })
    if (Object.keys(changes).length) await log(client, actor, 'update', 'country', id, `Updated country ${name}`, changes)
    return { id }
  })
}

export async function deleteCountry(id: number, actor: string) {
  return withTransaction(async client => {
    const { rows: [k] } = await client.query(
      `SELECT k.name, k.cost, c.name AS continent,
         (SELECT count(*)::int FROM universities u WHERE u.country_id = k.id) AS universities
       FROM countries k JOIN continents c ON c.id = k.continent_id WHERE k.id = $1 FOR UPDATE OF k`, [id])
    if (!k) throw new NotFoundError('Country not found.')
    await client.query('DELETE FROM countries WHERE id = $1', [id])
    await log(client, actor, 'delete', 'country', id, `Deleted country ${k.name} with ${plural(k.universities, 'university')}`,
      { name: k.name, continent: k.continent, cost: k.cost, universities: k.universities })
    return { id }
  })
}

/* ─── Universities ───────────────────────────────────────────────────────── */

function universityFields(input: Record<string, unknown>) {
  const name = requireName(input.name, 'University')
  const website = optional(input.website)
  if (website && !isUrl(website)) throw new InputError('Website must start with http:// or https://')
  const logo = optional(input.logo)
  if (logo && !isUrl(logo) && !logo.startsWith('/')) throw new InputError('Logo must be a full URL or a path such as /logos/name.png')
  return { name, website, logo }
}

async function requireCountry(client: PoolClient, id: unknown) {
  const { rows: [k] } = await client.query('SELECT id, name, continent_id FROM countries WHERE id = $1', [Number(id) || 0])
  if (!k) throw new InputError('Choose a country.')
  return k as { id: number; name: string; continent_id: string }
}

export async function createUniversity(input: Record<string, unknown>, actor: string) {
  const fields = universityFields(input)
  return withTransaction(async client => {
    const country = await requireCountry(client, input.countryId)
    let id: number
    try {
      const { rows: [r] } = await client.query(
        'INSERT INTO universities (country_id, name, logo, website, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [country.id, fields.name, fields.logo, fields.website, await nextSortOrder(client, 'universities', 'country_id', country.id)])
      id = r.id
    } catch (err) {
      if (isUniqueViolation(err)) throw new InputError(`“${fields.name}” is already listed in ${country.name}.`)
      throw err
    }
    await log(client, actor, 'create', 'university', id, `Added university ${fields.name} (${country.name})`,
      { ...fields, country: country.name })
    return { id }
  })
}

export async function updateUniversity(id: number, input: Record<string, unknown>, actor: string) {
  const fields = universityFields(input)
  return withTransaction(async client => {
    const { rows: [before] } = await client.query(
      `SELECT u.name, u.logo, u.website, u.country_id, k.name AS country FROM universities u
       JOIN countries k ON k.id = u.country_id WHERE u.id = $1 FOR UPDATE OF u`, [id])
    if (!before) throw new NotFoundError('University not found.')
    const country = await requireCountry(client, input.countryId)
    const moved = country.id !== before.country_id
    try {
      await client.query(
        `UPDATE universities SET name = $2, logo = $3, website = $4, country_id = $5, updated_at = now(),
           sort_order = CASE WHEN $6 THEN $7 ELSE sort_order END WHERE id = $1`,
        [id, fields.name, fields.logo, fields.website, country.id, moved,
          moved ? await nextSortOrder(client, 'universities', 'country_id', country.id) : 0])
    } catch (err) {
      if (isUniqueViolation(err)) throw new InputError(`“${fields.name}” is already listed in ${country.name}.`)
      throw err
    }
    // Moving to another continent removes it from the old continent's top 5
    await client.query('DELETE FROM continent_top WHERE university_id = $1 AND continent_id <> $2', [id, country.continent_id])
    const changes = diff(
      { name: before.name, logo: before.logo, website: before.website, country: before.country },
      { ...fields, country: country.name })
    if (Object.keys(changes).length) {
      await log(client, actor, 'update', 'university', id, `Updated university ${fields.name}`, changes)
    }
    return { id }
  })
}

export async function deleteUniversity(id: number, actor: string) {
  return withTransaction(async client => {
    const { rows: [u] } = await client.query(
      `SELECT u.name, u.logo, u.website, k.name AS country FROM universities u
       JOIN countries k ON k.id = u.country_id WHERE u.id = $1 FOR UPDATE OF u`, [id])
    if (!u) throw new NotFoundError('University not found.')
    await client.query('DELETE FROM universities WHERE id = $1', [id])
    await log(client, actor, 'delete', 'university', id, `Deleted university ${u.name} (${u.country})`,
      { name: u.name, country: u.country, logo: u.logo, website: u.website })
    return { id }
  })
}
