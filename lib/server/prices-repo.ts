import 'server-only'
import { pool, withTransaction } from '@/lib/server/db'
import { InputError, log } from '@/lib/server/atlas-repo'
import {
  CATEGORIES, DEFAULT_PRICES, buildCatalogue, bundleKey, packageKey, type PriceOverrides,
} from '@/lib/services'
import snapshot from '@/lib/service-prices.json'

const savedPrices = snapshot as PriceOverrides

const MAX_PRICE = 10_000_000

export async function getPriceOverrides(): Promise<PriceOverrides> {
  const { rows } = await pool.query('SELECT key, price_inr FROM service_prices')
  return Object.fromEntries(rows.map(r => [r.key, r.price_inr]))
}

async function currentPrices(): Promise<PriceOverrides> {
  return { ...DEFAULT_PRICES, ...savedPrices, ...(await getPriceOverrides()) }
}

// Everything admin → Service Prices shows: each service's options and each bundle, with the price in use
export async function listPrices() {
  const prices = await currentPrices()
  const { services, bundles } = buildCatalogue(prices)
  return {
    categories: CATEGORIES.map(c => ({ id: c.id, label: c.label })),
    services: services.map(s => ({
      slug: s.slug,
      name: s.name,
      category: s.category,
      comingSoon: !!s.comingSoon,
      packages: s.packages.map(p => ({
        key: packageKey(s.slug, p.name),
        name: p.name,
        detail: p.detail,
        per: p.per ?? null,
        priceINR: p.priceINR,
        defaultINR: DEFAULT_PRICES[packageKey(s.slug, p.name)],
      })),
    })),
    bundles: bundles.map(b => ({
      key: bundleKey(b.slug),
      slug: b.slug,
      name: b.name,
      comingSoon: !!b.comingSoon,
      priceINR: b.priceINR,
      defaultINR: DEFAULT_PRICES[bundleKey(b.slug)],
      items: b.items.map(i => ({ label: i.label, key: i.package ? packageKey(i.service, i.package) : null })),
    })),
  }
}

// A readable name for a price key, for the activity log
function labelFor(key: string) {
  const [kind, slug, option] = key.split(':')
  const { services, bundles } = buildCatalogue({})
  if (kind === 'bundle') return `${bundles.find(b => b.slug === slug)?.name ?? slug} bundle`
  return `${services.find(s => s.slug === slug)?.name ?? slug}: ${option}`
}

export async function updatePrices(input: unknown, actor: string) {
  const changes = (input as { prices?: unknown })?.prices
  if (!changes || typeof changes !== 'object') throw new InputError('Nothing to save.')

  const next: PriceOverrides = {}
  for (const [key, raw] of Object.entries(changes as Record<string, unknown>)) {
    if (!(key in DEFAULT_PRICES)) throw new InputError(`Unknown price: ${key}`)
    const value = typeof raw === 'string' ? Number(raw) : raw
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > MAX_PRICE) {
      throw new InputError(`${labelFor(key)}: enter a whole number of rupees between 0 and ${MAX_PRICE.toLocaleString('en-IN')}.`)
    }
    next[key] = value
  }

  return withTransaction(async client => {
    const before: PriceOverrides = { ...DEFAULT_PRICES, ...savedPrices }
    const { rows } = await client.query('SELECT key, price_inr FROM service_prices')
    for (const r of rows) before[r.key] = r.price_inr

    const diff: Record<string, { from: number; to: number }> = {}
    for (const [key, value] of Object.entries(next)) {
      if (before[key] === value) continue
      await client.query(
        `INSERT INTO service_prices (key, price_inr, updated_by) VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET price_inr = EXCLUDED.price_inr, updated_by = EXCLUDED.updated_by, updated_at = now()`,
        [key, value, actor])
      diff[labelFor(key)] = { from: before[key], to: value }
    }

    const count = Object.keys(diff).length
    if (count) {
      const summary = count === 1
        ? `Changed the price of ${Object.keys(diff)[0]}`
        : `Changed ${count} service prices`
      await log(client, actor, 'update', 'price', 'service-prices', summary, diff)
    }
    return { changed: count }
  })
}
