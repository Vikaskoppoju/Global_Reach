'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import type { ActivityAction, ActivityEntity, ActivityEntry } from '@/types'

const PAGE = 50

const ACTION_STYLE: Record<ActivityAction, string> = {
  create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  update: 'bg-blue-50 text-blue-700 border-blue-200',
  delete: 'bg-red-50 text-red-600 border-red-200',
  seed: 'bg-navy/5 text-navy/60 border-navy/15',
}

const ENTITY_LABEL: Record<ActivityEntity, string> = {
  continent: 'Continent', country: 'Country', university: 'University', atlas: 'Whole atlas',
}

const FIELD_LABEL: Record<string, string> = {
  name: 'Name', tagline: 'Tagline', imageUrl: 'Card image', top: 'Top 5', cost: 'Tuition note',
  continent: 'Continent', country: 'Country', website: 'Website', logo: 'Logo',
  countries: 'Countries', universities: 'Universities',
}

const selCls = 'px-3 py-2 rounded-xl border border-gold/20 text-[13px] text-navy outline-none focus:border-gold bg-white cursor-pointer'

function show(value: unknown) {
  if (value === null || value === undefined || value === '') return <span className="text-navy/35">empty</span>
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

function formatWhen(iso: string) {
  const d = new Date(iso)
  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  const relative = mins < 1 ? 'just now' : mins < 60 ? `${mins} min ago`
    : mins < 1440 ? `${Math.round(mins / 60)} h ago` : `${Math.round(mins / 1440)} d ago`
  return { relative, absolute: d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) }
}

// Field-by-field view of what an entry changed
function Changes({ entry }: { entry: ActivityEntry }) {
  if (!entry.changes) return <p className="text-[12px] text-navy/45">No details recorded.</p>
  const rows = Object.entries(entry.changes)
  if (entry.action === 'update') {
    return (
      <table className="text-[12px]">
        <tbody>
          {rows.map(([field, v]) => {
            const { from, to } = v as { from: unknown; to: unknown }
            return (
              <tr key={field} className="align-top">
                <td className="py-1 pr-4 font-semibold text-navy/55 whitespace-nowrap">{FIELD_LABEL[field] ?? field}</td>
                <td className="py-1 pr-3 text-red-600/80 line-through decoration-red-300">{show(from)}</td>
                <td className="py-1 pr-3 text-navy/30">→</td>
                <td className="py-1 text-emerald-700">{show(to)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-[12px]">
      {rows.map(([field, value]) => (
        <Fragment key={field}>
          <dt className="font-semibold text-navy/55">{FIELD_LABEL[field] ?? field}</dt>
          <dd className="text-navy/75 break-all">{show(value)}</dd>
        </Fragment>
      ))}
    </dl>
  )
}

export default function ActivityLog() {
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = useCallback(async (beforeId?: number) => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ limit: String(PAGE) })
    if (entity) params.set('entity', entity)
    if (action) params.set('action', action)
    if (beforeId) params.set('before', String(beforeId))
    try {
      const res = await fetch(`/api/admin/activity?${params}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? `Could not load activity (${res.status})`)
      setEntries(prev => (beforeId ? [...prev, ...data] : data))
      setHasMore(data.length === PAGE)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [entity, action])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight text-navy md:text-[30px]" style={{ letterSpacing: '-0.5px' }}>
            Activity Log
          </h1>
          <p className="mt-1 text-[14px] text-navy/45">
            Every change made in the masters: who made it, when, and what changed. Stored in the database.
          </p>
        </div>
        <button type="button" onClick={() => load()}
          className="px-3 py-2 rounded-xl border border-gold/25 text-[13px] font-semibold text-navy/70 hover:border-gold hover:text-navy transition">
          Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select className={selCls} value={entity} onChange={e => setEntity(e.target.value)} aria-label="Record type">
          <option value="">All records</option>
          <option value="continent">Continents</option>
          <option value="country">Countries</option>
          <option value="university">Universities</option>
          <option value="atlas">Whole atlas (seeding)</option>
        </select>
        <select className={selCls} value={action} onChange={e => setAction(e.target.value)} aria-label="Action">
          <option value="">All actions</option>
          <option value="create">Created</option>
          <option value="update">Updated</option>
          <option value="delete">Deleted</option>
          <option value="seed">Seeded</option>
        </select>
      </div>

      {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-gold/15 bg-white">
        <table className="w-full">
          <thead className="border-b border-gold/15 bg-[#FBF8F1]">
            <tr>
              {['When', 'Who', 'Action', 'Record', 'Summary', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-navy/45">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(e => {
              const when = formatWhen(e.occurredAt)
              const open = expanded === e.id
              return (
                <Fragment key={e.id}>
                  <tr className="border-b border-gold/10 align-top">
                    <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                      <div className="text-navy">{when.relative}</div>
                      <div className="text-[11px] text-navy/40">{when.absolute}</div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-navy/75 max-w-[200px] break-words">{e.actor}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${ACTION_STYLE[e.action]}`}>
                        {e.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-navy/60 whitespace-nowrap">{ENTITY_LABEL[e.entity]}</td>
                    <td className="px-4 py-3 text-[13px] text-navy">{e.summary}</td>
                    <td className="px-4 py-3 text-right">
                      {e.changes && (
                        <button type="button" onClick={() => setExpanded(open ? null : e.id)}
                          className="text-[12px] font-semibold text-gold hover:text-navy whitespace-nowrap">
                          {open ? 'Hide details' : 'Details'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-gold/10 bg-[#FBF8F1]">
                      <td colSpan={6} className="px-6 py-4"><Changes entry={e} /></td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        {!loading && entries.length === 0 && !error && (
          <p className="p-6 text-center text-[13px] text-navy/45">No activity recorded yet.</p>
        )}
        {loading && <p className="p-6 text-center text-[13px] text-navy/45">Loading…</p>}
      </div>

      {hasMore && !loading && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => load(entries[entries.length - 1]?.id)}
            className="px-4 py-2.5 rounded-xl bg-gold text-navy text-[13px] font-semibold transition hover:bg-gold/90">
            Load older activity
          </button>
        </div>
      )}
    </div>
  )
}
