'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import { ENQUIRY_OPTIONS, NOT_SURE } from '@/lib/services'
import { baseScholarships } from '@/lib/scholarships'
import type { EnquiryStatus, ServiceEnquiry } from '@/types'

const PAGE = 50

const STATUSES: { id: EnquiryStatus; label: string; style: string }[] = [
  { id: 'new', label: 'New', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'contacted', label: 'Contacted', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'enrolled', label: 'Enrolled', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'closed', label: 'Closed', style: 'bg-navy/5 text-navy/60 border-navy/15' },
]

const selCls = 'px-3 py-2 rounded-xl border border-gold/20 text-[13px] text-navy outline-none focus:border-gold bg-white cursor-pointer'

const CALL_TIME: Record<string, string> = {
  morning: 'Morning (9am–12pm)', afternoon: 'Afternoon (12–4pm)', evening: 'Evening (4–8pm)', any: 'Any time',
}

const serviceLabel = (slug: string) =>
  slug === NOT_SURE ? 'Not sure yet, wants help choosing' : ENQUIRY_OPTIONS.find(o => o.value === slug)?.label ?? slug
const scholarshipName = (id: string) => baseScholarships.find(s => s.id === id)?.name ?? id

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function Enquiries() {
  const [status, setStatus] = useState('')
  const [entries, setEntries] = useState<ServiceEnquiry[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = useCallback(async (beforeId?: number) => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ limit: String(PAGE) })
    if (status) params.set('status', status)
    if (beforeId) params.set('before', String(beforeId))
    try {
      const res = await fetch(`/api/admin/enquiries?${params}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? `Could not load enquiries (${res.status})`)
      setEntries(prev => (beforeId ? [...prev, ...data] : data))
      setHasMore(data.length === PAGE)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { load() }, [load])

  async function changeStatus(id: number, next: EnquiryStatus) {
    setError('')
    const before = entries
    setEntries(list => list.map(e => (e.id === id ? { ...e, status: next } : e)))
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? 'Could not update the status.')
    } catch (err) {
      setEntries(before)
      setError((err as Error).message)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight text-navy md:text-[30px]" style={{ letterSpacing: '-0.5px' }}>
            Call-back Requests
          </h1>
          <p className="mt-1 text-[14px] text-navy/45">
            Students who asked us to call them back from the services pages. Call them, then update the status.
          </p>
        </div>
        <button type="button" onClick={() => load()}
          className="px-3 py-2 rounded-xl border border-gold/25 text-[13px] font-semibold text-navy/70 hover:border-gold hover:text-navy transition">
          Refresh
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select className={selCls} value={status} onChange={e => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-gold/15 bg-white">
        <table className="w-full">
          <thead className="border-b border-gold/15 bg-[#FBF8F1]">
            <tr>
              {['Received', 'Student', 'Best time', 'Service', 'Score / intake', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-navy/45">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(e => {
              const open = expanded === e.id
              const style = STATUSES.find(s => s.id === e.status)?.style ?? ''
              return (
                <Fragment key={e.id}>
                  <tr className="border-b border-gold/10 align-top">
                    <td className="px-4 py-3 text-[13px] text-navy/70 whitespace-nowrap">{formatWhen(e.createdAt)}</td>
                    <td className="px-4 py-3 text-[13px]">
                      <div className="font-semibold text-navy">{e.name}</div>
                      {e.phone && (
                        <a href={`tel:${e.phone.replace(/[^\d+]/g, '')}`} className="font-semibold text-gold hover:text-navy whitespace-nowrap">
                          {e.phone}
                        </a>
                      )}
                      {e.email && <div className="text-navy/55 break-all">{e.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-navy/70 whitespace-nowrap">{e.callTime ? CALL_TIME[e.callTime] ?? e.callTime : 'Any time'}</td>
                    <td className="px-4 py-3 text-[13px]">
                      <div className="text-navy">{serviceLabel(e.service)}</div>
                      {e.package && <div className="text-navy/50">{e.package}</div>}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-navy/70">{e.currentScore ?? e.targetIntake ?? <span className="text-navy/30">—</span>}</td>
                    <td className="px-4 py-3">
                      <select value={e.status} onChange={ev => changeStatus(e.id, ev.target.value as EnquiryStatus)}
                        aria-label={`Status for ${e.name}`}
                        className={`rounded-full border px-2.5 py-1 text-[12px] font-bold outline-none cursor-pointer ${style}`}>
                        {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(e.message || e.scholarshipId) && (
                        <button type="button" onClick={() => setExpanded(open ? null : e.id)}
                          className="text-[12px] font-semibold text-gold hover:text-navy whitespace-nowrap">
                          {open ? 'Hide details' : 'Details'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-gold/10 bg-[#FBF8F1]">
                      <td colSpan={7} className="px-6 py-4 text-[13px] text-navy/75">
                        <div className="flex flex-col gap-2">
                        {e.scholarshipId && <p><strong className="text-navy">Scholarship:</strong> {scholarshipName(e.scholarshipId)}</p>}
                        {e.message && <p className="whitespace-pre-line"><strong className="text-navy">Message:</strong> {e.message}</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        {!loading && entries.length === 0 && !error && (
          <p className="p-6 text-center text-[13px] text-navy/45">No call-back requests yet.</p>
        )}
        {loading && <p className="p-6 text-center text-[13px] text-navy/45">Loading…</p>}
      </div>

      {hasMore && !loading && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => load(entries[entries.length - 1]?.id)}
            className="px-4 py-2.5 rounded-xl bg-gold text-navy text-[13px] font-semibold transition hover:bg-gold/90">
            Load older requests
          </button>
        </div>
      )}
    </div>
  )
}
