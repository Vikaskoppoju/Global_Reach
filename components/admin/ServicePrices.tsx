'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { adminRequest } from '@/lib/atlas'

interface PackageRow { key: string; name: string; detail: string; per: string | null; priceINR: number; defaultINR: number }
interface ServiceRow { slug: string; name: string; category: string; comingSoon: boolean; packages: PackageRow[] }
interface BundleRow {
  key: string; slug: string; name: string; comingSoon: boolean; priceINR: number; defaultINR: number
  items: { label: string; key: string | null }[]
}
interface PricesData {
  readOnly: boolean
  categories: { id: string; label: string }[]
  services: ServiceRow[]
  bundles: BundleRow[]
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
const parse = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v.trim()) : null)

function PriceInput({ id, value, onChange, disabled, changed, invalid }: {
  id: string; value: string; onChange: (v: string) => void; disabled: boolean; changed: boolean; invalid: boolean
}) {
  return (
    <div className={`flex items-center rounded-xl border bg-white transition-colors
      ${invalid ? 'border-red-400' : changed ? 'border-gold ring-2 ring-gold/20' : 'border-gold/25'}`}>
      <span className="pl-3 text-[14px] text-navy/45" aria-hidden>₹</span>
      <input id={id} inputMode="numeric" value={value} disabled={disabled} onChange={e => onChange(e.target.value.replace(/[^\d]/g, ''))}
        className="w-28 bg-transparent px-2 py-2 text-[14px] font-semibold text-navy tabular-nums outline-none disabled:text-navy/50" />
    </div>
  )
}

export default function ServicePrices() {
  const { user } = useAuth()
  const actor = user ? `${user.name} <${user.email}>` : 'unknown admin'
  const [data, setData] = useState<PricesData | null>(null)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/prices', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? `Could not load prices (${res.status})`)
      setData(json)
      setDraft({})
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Current price per key, before any unsaved edits
  const saved = useMemo(() => {
    const out: Record<string, number> = {}
    data?.services.forEach(s => s.packages.forEach(p => { out[p.key] = p.priceINR }))
    data?.bundles.forEach(b => { out[b.key] = b.priceINR })
    return out
  }, [data])

  const valueOf = (key: string) => draft[key] ?? String(saved[key] ?? '')
  const priceOf = (key: string) => parse(valueOf(key)) ?? saved[key] ?? 0
  const changedKeys = Object.keys(draft).filter(k => parse(draft[k]) !== saved[k])
  const invalidKeys = Object.keys(draft).filter(k => parse(draft[k]) === null)
  const readOnly = !!data?.readOnly

  const set = (key: string) => (v: string) => { setNotice(''); setDraft(d => ({ ...d, [key]: v })) }

  async function save() {
    if (invalidKeys.length) return setError('Some prices are empty. Enter a whole number of rupees, or 0 for free.')
    setSaving(true)
    setError('')
    try {
      const prices = Object.fromEntries(changedKeys.map(k => [k, parse(draft[k])]))
      const res = await adminRequest<{ changed: number }>('PUT', '/api/admin/prices', actor, { prices })
      await load()
      setNotice(`Saved ${res.changed} price${res.changed === 1 ? '' : 's'}. The website shows the new prices on the next page load. `
        + 'Run npm run db:export before you deploy, so the live site gets them too.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight text-navy md:text-[30px]" style={{ letterSpacing: '-0.5px' }}>
            Service Prices
          </h1>
          <p className="mt-1 text-[14px] text-navy/45 max-w-2xl">
            Prices in Indian rupees for every option on the services pages, and for the bundles. Enter 0 to make an option free.
            Changes are recorded in the Activity Log.
          </p>
        </div>
        <button type="button" onClick={load}
          className="px-3 py-2 rounded-xl border border-gold/25 text-[13px] font-semibold text-navy/70 hover:border-gold hover:text-navy transition">
          Refresh
        </button>
      </div>

      {readOnly && (
        <p className="mb-6 rounded-xl border border-gold/20 bg-gold-pale px-4 py-3 text-[13px] text-navy/70">
          This site is running on the static snapshot (production mode), so prices are read-only here. Change them in
          development (npm run dev), then run npm run db:export and rebuild.
        </p>
      )}
      {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700" role="alert">{error}</p>}
      {notice && <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-800" role="status">{notice}</p>}
      {loading && !data && <p className="rounded-2xl border border-gold/15 bg-white p-6 text-center text-[13px] text-navy/45">Loading…</p>}

      {data && (
        <div className="flex flex-col gap-8">
          {data.categories.map(cat => (
            <section key={cat.id}>
              <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[1.5px] text-gold">{cat.label}</h2>
              <div className="flex flex-col gap-4">
                {data.services.filter(s => s.category === cat.id).map(s => (
                  <div key={s.slug} className="rounded-2xl border border-gold/15 bg-white">
                    <div className="flex flex-wrap items-center gap-2 border-b border-gold/10 px-5 py-3">
                      <h3 className="font-display text-[17px] font-bold text-navy">{s.name}</h3>
                      {s.comingSoon && (
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-gold-pale text-[#8A6A1A] border border-gold/40 rounded-full px-2 py-0.5">
                          Coming soon
                        </span>
                      )}
                      <a href={`/services/${s.slug}`} target="_blank" rel="noopener noreferrer"
                        className="ml-auto text-[12px] font-semibold text-gold hover:text-navy">View page ↗</a>
                    </div>
                    <ul className="divide-y divide-gold/10">
                      {s.packages.map(p => {
                        const changed = changedKeys.includes(p.key)
                        const current = priceOf(p.key)
                        return (
                          <li key={p.key} className={`flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 ${changed ? 'bg-gold-pale/50' : ''}`}>
                            <label htmlFor={p.key} className="flex-1 min-w-[220px]">
                              <span className="block text-[14px] font-semibold text-navy">{p.name}</span>
                              <span className="block text-[12px] text-navy/50">{p.detail}</span>
                            </label>
                            <div className="flex items-center gap-3">
                              <PriceInput id={p.key} value={valueOf(p.key)} onChange={set(p.key)} disabled={readOnly || saving}
                                changed={changed} invalid={invalidKeys.includes(p.key)} />
                              <span className="w-24 text-[12px] text-navy/45">
                                {p.per ?? (current === 0 ? 'shown as Free' : '')}
                              </span>
                            </div>
                            {current !== p.defaultINR && (
                              <button type="button" disabled={readOnly || saving} onClick={() => set(p.key)(String(p.defaultINR))}
                                className="text-[12px] text-navy/45 hover:text-navy underline-offset-2 hover:underline disabled:hidden">
                                Reset to {inr(p.defaultINR)}
                              </button>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[1.5px] text-gold">Bundles</h2>
            <div className="grid gap-4 lg:grid-cols-3">
              {data.bundles.map(b => {
                const separately = b.items.reduce((sum, i) => sum + (i.key ? priceOf(i.key) : 0), 0)
                const price = priceOf(b.key)
                const discount = separately - price
                const changed = changedKeys.includes(b.key)
                return (
                  <div key={b.key} className={`rounded-2xl border bg-white p-5 flex flex-col gap-3 ${changed ? 'border-gold' : 'border-gold/15'}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-[17px] font-bold text-navy">{b.name}</h3>
                      {b.comingSoon && (
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-gold-pale text-[#8A6A1A] border border-gold/40 rounded-full px-2 py-0.5">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <ul className="flex flex-col gap-1 text-[12px] text-navy/60">
                      {b.items.map(i => (
                        <li key={i.label} className="flex justify-between gap-3">
                          <span>{i.label}</span>
                          <span className="tabular-nums whitespace-nowrap">{i.key ? inr(priceOf(i.key)) : 'free extra'}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between gap-3 border-t border-gold/10 pt-3">
                      <label htmlFor={b.key} className="text-[13px] font-semibold text-navy">Bundle price</label>
                      <PriceInput id={b.key} value={valueOf(b.key)} onChange={set(b.key)} disabled={readOnly || saving}
                        changed={changed} invalid={invalidKeys.includes(b.key)} />
                    </div>
                    <p className={`text-[12px] ${discount > 0 ? 'text-green-700' : 'text-red-600'}`}>
                      {discount > 0
                        ? `Separately ${inr(separately)}: students save ${inr(discount)}.`
                        : `Separately ${inr(separately)}: the bundle doesn’t save anything at this price.`}
                    </p>
                    {price !== b.defaultINR && (
                      <button type="button" disabled={readOnly || saving} onClick={() => set(b.key)(String(b.defaultINR))}
                        className="self-start text-[12px] text-navy/45 hover:text-navy hover:underline underline-offset-2 disabled:hidden">
                        Reset to {inr(b.defaultINR)}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {/* Save bar, shown while there are unsaved changes */}
      {!readOnly && (changedKeys.length > 0 || invalidKeys.length > 0) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold/20 bg-white/95 backdrop-blur px-5 py-3 lg:pl-72">
          <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-3">
            <span className="text-[14px] text-navy">
              <strong>{changedKeys.length}</strong> unsaved change{changedKeys.length === 1 ? '' : 's'}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setDraft({}); setError('') }} disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-gold/25 text-[13px] font-semibold text-navy/70 hover:border-gold hover:text-navy transition">
                Discard
              </button>
              <button type="button" onClick={save} disabled={saving || invalidKeys.length > 0}
                className="px-5 py-2.5 rounded-xl bg-navy text-white text-[13px] font-semibold hover:bg-navy-mid transition disabled:opacity-60">
                {saving ? 'Saving…' : 'Save prices'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
