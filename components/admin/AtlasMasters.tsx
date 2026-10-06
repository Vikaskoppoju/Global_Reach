'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useAtlasState, adminRequest, adminUpload, notifyAtlasChanged, countUniversities } from '@/lib/atlas'
import type { Continent } from '@/types'
import SearchableSelect from '@/components/ui/SearchableSelect'
import UniversityLogo from '@/components/ui/UniversityLogo'

const inputCls = 'mt-1.5 w-full rounded-xl border border-gold/20 bg-white px-4 py-2.5 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10'
const selCls = 'px-3 py-2 rounded-xl border border-gold/20 text-[13px] text-navy outline-none focus:border-gold bg-white cursor-pointer'
const btnPrimary = 'px-4 py-2.5 rounded-xl bg-gold text-navy text-[13px] font-semibold transition hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed'
const btnGhost = 'px-3 py-1.5 rounded-lg border border-gold/25 text-[12px] font-semibold text-navy/70 hover:border-gold hover:text-navy transition disabled:opacity-40 disabled:cursor-not-allowed'
const btnDanger = 'px-3 py-1.5 rounded-lg border border-red-200 text-[12px] font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed'
const thCls = 'px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-navy/45'
const tdCls = 'px-4 py-3 text-[13px] text-navy/75'

// Shared by every master: the data, whether editing is possible, and who is acting
interface MasterProps {
  atlas: Continent[]
  canEdit: boolean
  actor: string
}

// Runs an admin request; on success reloads the atlas everywhere, on failure returns the message
async function save(request: () => Promise<unknown>): Promise<string> {
  try {
    await request()
    notifyAtlasChanged()
    return ''
  } catch (err) {
    return (err as Error).message
  }
}

async function confirmAndDelete(message: string, request: () => Promise<unknown>) {
  if (!window.confirm(message)) return
  const error = await save(request)
  if (error) window.alert(error)
}

/* ─── Shared UI ──────────────────────────────────────────────────────────── */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:py-12"
      style={{ background: 'rgba(15,31,61,0.72)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}>
      {/* The overlay scrolls rather than the dialog, so dropdowns inside the form aren't clipped */}
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gold/15 px-6 py-4">
          <h3 className="font-display text-[20px] font-bold text-navy">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close"
            className="w-8 h-8 rounded-full bg-navy/5 text-navy/60 hover:bg-navy/10 text-lg">×</button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-[12px] font-semibold text-navy/55">
      {label}
      {children}
      {hint && <span className="mt-1 block text-[11px] font-normal text-navy/40">{hint}</span>}
    </label>
  )
}

function FormActions({ error, saving, onCancel, submitLabel }: {
  error: string; saving: boolean; onCancel: () => void; submitLabel: string
}) {
  return (
    <>
      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className={btnGhost}>Cancel</button>
        <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : submitLabel}</button>
      </div>
    </>
  )
}

// Form state shared by the three masters: which record is open, the error and the saving flag
function useEditor<T>() {
  const [editing, setEditing] = useState<T | 'new' | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const open = (target: T | 'new') => { setEditing(target); setError('') }
  const close = () => setEditing(null)
  const submit = async (request: () => Promise<unknown>) => {
    setSaving(true)
    const message = await save(request)
    setSaving(false)
    if (message) setError(message)
    else close()
  }
  return { editing, error, saving, open, close, submit }
}

/* ─── Continents ─────────────────────────────────────────────────────────── */

interface ContinentForm { name: string; tagline: string; imageUrl: string; topIds: string[] }

function ContinentsMaster({ atlas, canEdit, actor }: MasterProps) {
  const editor = useEditor<Continent>()
  const [form, setForm] = useState<ContinentForm>({ name: '', tagline: '', imageUrl: '', topIds: [] })

  const open = (c: Continent | 'new') => {
    editor.open(c)
    setForm(c === 'new'
      ? { name: '', tagline: '', imageUrl: '', topIds: [] }
      : { name: c.name, tagline: c.tagline, imageUrl: c.imageUrl, topIds: (c.topIds ?? []).map(String) })
  }

  const current = editor.editing && editor.editing !== 'new' ? editor.editing : null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const body = { name: form.name, tagline: form.tagline, imageUrl: form.imageUrl }
    editor.submit(() => current
      ? adminRequest('PUT', `/api/admin/continents/${current.id}`, actor, { ...body, topIds: form.topIds.filter(Boolean).map(Number) })
      : adminRequest('POST', '/api/admin/continents', actor, body))
  }

  const topOptions = useMemo(() => [
    { value: '', label: 'None' },
    ...(current?.countries.flatMap(k => k.universities.map(u => ({ value: String(u.id), label: u.name, meta: k.name }))) ?? [])
      .sort((a, b) => a.label.localeCompare(b.label)),
  ], [current])

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" disabled={!canEdit} onClick={() => open('new')} className={btnPrimary}>+ Add continent</button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gold/15 bg-white">
        <table className="w-full">
          <thead className="border-b border-gold/15 bg-[#FBF8F1]">
            <tr><th className={thCls}>Continent</th><th className={thCls}>Countries</th><th className={thCls}>Universities</th>
              <th className={thCls}>Top 5</th><th className={thCls} /></tr>
          </thead>
          <tbody>
            {atlas.map(c => (
              <tr key={c.id} className="border-b border-gold/10 last:border-0">
                <td className={tdCls}>
                  <div className="font-semibold text-navy">{c.name}</div>
                  <div className="text-[12px] text-navy/45">{c.tagline}</div>
                </td>
                <td className={tdCls}>{c.countries.length}</td>
                <td className={tdCls}>{countUniversities(c)}</td>
                <td className={tdCls}>{c.top.length ? c.top.join(', ') : <span className="text-navy/35">Not set</span>}</td>
                <td className={`${tdCls} whitespace-nowrap text-right`}>
                  <button type="button" disabled={!canEdit} onClick={() => open(c)} className={btnGhost}>Edit</button>{' '}
                  <button type="button" disabled={!canEdit} className={btnDanger}
                    onClick={() => confirmAndDelete(
                      `Delete ${c.name}? This also deletes its ${c.countries.length} countries and ${countUniversities(c)} universities.`,
                      () => adminRequest('DELETE', `/api/admin/continents/${c.id}`, actor))}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editor.editing && (
          <Modal title={current ? `Edit ${current.name}` : 'Add continent'} onClose={editor.close}>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Tagline"><input className={inputCls} value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} /></Field>
              <Field label="Card image URL" hint="Shown on the landing page card. Unsplash links work out of the box.">
                <input className={inputCls} value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
              </Field>
              {current ? (
                <div>
                  <p className="text-[12px] font-semibold text-navy/55">Top 5 universities (landing page)</p>
                  <div className="mt-1.5 flex flex-col gap-2">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-5 text-[12px] font-bold text-navy/40">{i + 1}</span>
                        <SearchableSelect tone="light" className="flex-1" value={form.topIds[i] ?? ''}
                          searchPlaceholder="Search universities…" options={topOptions}
                          onChange={v => {
                            const topIds = [...form.topIds]
                            topIds[i] = v
                            setForm({ ...form, topIds })
                          }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-navy/45">Add countries and universities first, then edit the continent to pick its top 5.</p>
              )}
              <FormActions error={editor.error} saving={editor.saving} onCancel={editor.close}
                submitLabel={current ? 'Save changes' : 'Add continent'} />
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Countries ──────────────────────────────────────────────────────────── */

interface CountryForm { name: string; continentId: string; cost: string }

function CountriesMaster({ atlas, canEdit, actor }: MasterProps) {
  const [continentFilter, setContinentFilter] = useState('')
  const [q, setQ] = useState('')
  const editor = useEditor<number>() // country id
  const [form, setForm] = useState<CountryForm>({ name: '', continentId: '', cost: '' })

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return atlas.flatMap(c => c.countries.map(k => ({ ...k, continent: c })))
      .filter(r => (!continentFilter || r.continent.id === continentFilter) && (!query || r.name.toLowerCase().includes(query)))
  }, [atlas, continentFilter, q])

  const open = (id: number | 'new') => {
    editor.open(id)
    if (id === 'new') return setForm({ name: '', continentId: continentFilter || atlas[0]?.id || '', cost: '' })
    const row = rows.find(r => r.id === id)!
    setForm({ name: row.name, continentId: row.continent.id, cost: row.cost ?? '' })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    editor.submit(() => editor.editing === 'new'
      ? adminRequest('POST', '/api/admin/countries', actor, form)
      : adminRequest('PUT', `/api/admin/countries/${editor.editing}`, actor, form))
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select className={selCls} value={continentFilter} onChange={e => setContinentFilter(e.target.value)}>
          <option value="">All continents</option>
          {atlas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className={`${selCls} min-w-[200px] flex-1 cursor-text`} placeholder="Search countries…" value={q} onChange={e => setQ(e.target.value)} />
        <span className="text-[13px] text-navy/45">{rows.length} countries</span>
        <button type="button" disabled={!canEdit} onClick={() => open('new')} className={`${btnPrimary} ml-auto`}>+ Add country</button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gold/15 bg-white">
        <table className="w-full">
          <thead className="border-b border-gold/15 bg-[#FBF8F1]">
            <tr><th className={thCls}>Country</th><th className={thCls}>Continent</th><th className={thCls}>Universities</th>
              <th className={thCls}>Tuition note</th><th className={thCls} /></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id ?? r.name} className="border-b border-gold/10 last:border-0">
                <td className={`${tdCls} font-semibold text-navy`}>{r.name}</td>
                <td className={tdCls}>{r.continent.name}</td>
                <td className={tdCls}>{r.universities.length}</td>
                <td className={tdCls}>{r.cost ?? <span className="text-navy/35">—</span>}</td>
                <td className={`${tdCls} whitespace-nowrap text-right`}>
                  <button type="button" disabled={!canEdit} onClick={() => open(r.id!)} className={btnGhost}>Edit</button>{' '}
                  <button type="button" disabled={!canEdit} className={btnDanger}
                    onClick={() => confirmAndDelete(
                      `Delete ${r.name}? This also deletes its ${r.universities.length} universities.`,
                      () => adminRequest('DELETE', `/api/admin/countries/${r.id}`, actor))}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-[13px] text-navy/45">No countries match.</p>}
      </div>

      <AnimatePresence>
        {editor.editing && (
          <Modal title={editor.editing === 'new' ? 'Add country' : `Edit ${rows.find(r => r.id === editor.editing)?.name ?? 'country'}`}
            onClose={editor.close}>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Continent">
                <select className={`${inputCls} cursor-pointer`} value={form.continentId} onChange={e => setForm({ ...form, continentId: e.target.value })}>
                  {atlas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Tuition note (optional)" hint="Shown with the country, e.g. “From €3,000/yr”.">
                <input className={inputCls} value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
              </Field>
              <FormActions error={editor.error} saving={editor.saving} onCancel={editor.close}
                submitLabel={editor.editing === 'new' ? 'Add country' : 'Save changes'} />
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Logo: upload a file or paste a URL ─────────────────────────────────── */

function LogoField({ name, value, actor, onChange }: {
  name: string; value: string; actor: string; onChange: (logo: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file: File | undefined) => {
    if (!file) return
    setError('')
    // Quick checks before sending; the server checks the actual file contents again
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
      return setError('Upload a PNG, JPEG, WebP or GIF image.')
    }
    if (file.size > 1024 * 1024) return setError('Logos must be 1 MB or smaller.')
    setUploading(true)
    try {
      onChange(await adminUpload(file, actor))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = '' // allow choosing the same file again
    }
  }

  return (
    <div>
      <p className="text-[12px] font-semibold text-navy/55">Logo (optional)</p>
      <div className="mt-1.5 flex items-center gap-4 rounded-xl border border-dashed border-gold/35 bg-[#FBF8F1] p-3">
        <UniversityLogo name={name || '?'} logo={value.trim() || undefined} size="lg" tone="light" />
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
            onChange={e => upload(e.target.files?.[0])} />
          <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className={btnPrimary}>
            {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
          </button>
          {value && !uploading && (
            <button type="button" onClick={() => onChange('')} className={btnGhost}>Remove</button>
          )}
          <span className="w-full text-[11px] text-navy/40">PNG, JPEG, WebP or GIF, up to 1 MB. Square images look best.</span>
        </div>
      </div>
      {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
      <label className="mt-3 block text-[11px] font-semibold text-navy/45">
        Or paste an image URL
        <input className={inputCls} value={value} placeholder="https://… or /logos/name.png"
          onChange={e => onChange(e.target.value)} />
      </label>
    </div>
  )
}

/* ─── Universities ───────────────────────────────────────────────────────── */

const UNI_PAGE = 50

interface UniversityForm { name: string; countryId: string; website: string; logo: string }

function UniversitiesMaster({ atlas, canEdit, actor }: MasterProps) {
  const [continentFilter, setContinentFilter] = useState('')
  const [countryFilter, setCountryFilter] = useState('') // country id
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const editor = useEditor<number>() // university id
  const [form, setForm] = useState<UniversityForm>({ name: '', countryId: '', website: '', logo: '' })

  const countries = useMemo(() => atlas.flatMap(c => c.countries.map(k => ({ id: String(k.id), name: k.name, continent: c }))), [atlas])

  const countryOptions = useMemo(() => {
    const list = countries.filter(k => !continentFilter || k.continent.id === continentFilter)
      .sort((a, b) => a.name.localeCompare(b.name))
    return [{ value: '', label: 'All countries' }, ...list.map(k => ({ value: k.id, label: k.name, meta: k.continent.name }))]
  }, [countries, continentFilter])

  const formCountryOptions = useMemo(() =>
    [...countries].sort((a, b) => a.name.localeCompare(b.name))
      .map(k => ({ value: k.id, label: k.name, meta: k.continent.name })), [countries])

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return atlas.flatMap(c => c.countries.flatMap(k =>
      k.universities.map(u => ({ ...u, country: k.name, countryId: String(k.id), continent: c }))))
      .filter(r =>
        (!continentFilter || r.continent.id === continentFilter) &&
        (!countryFilter || r.countryId === countryFilter) &&
        (!query || r.name.toLowerCase().includes(query)))
  }, [atlas, continentFilter, countryFilter, q])

  useEffect(() => setPage(1), [continentFilter, countryFilter, q])
  const pages = Math.max(1, Math.ceil(rows.length / UNI_PAGE))
  const pageRows = rows.slice((page - 1) * UNI_PAGE, page * UNI_PAGE)

  const open = (id: number | 'new') => {
    editor.open(id)
    if (id === 'new') return setForm({ name: '', countryId: countryFilter, website: '', logo: '' })
    const row = rows.find(r => r.id === id)!
    setForm({ name: row.name, countryId: row.countryId, website: row.website ?? '', logo: row.logo ?? '' })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    editor.submit(() => editor.editing === 'new'
      ? adminRequest('POST', '/api/admin/universities', actor, form)
      : adminRequest('PUT', `/api/admin/universities/${editor.editing}`, actor, form))
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select className={selCls} value={continentFilter}
          onChange={e => { setContinentFilter(e.target.value); setCountryFilter('') }}>
          <option value="">All continents</option>
          {atlas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <SearchableSelect tone="light" className="w-56" value={countryFilter} onChange={setCountryFilter}
          searchPlaceholder="Search countries…" options={countryOptions} />
        <input className={`${selCls} min-w-[200px] flex-1 cursor-text`} placeholder="Search universities…" value={q} onChange={e => setQ(e.target.value)} />
        <span className="text-[13px] text-navy/45">{rows.length} universities</span>
        <button type="button" disabled={!canEdit} onClick={() => open('new')} className={`${btnPrimary} ml-auto`}>+ Add university</button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gold/15 bg-white">
        <table className="w-full">
          <thead className="border-b border-gold/15 bg-[#FBF8F1]">
            <tr><th className={thCls}>University</th><th className={thCls}>Country</th><th className={thCls}>Continent</th>
              <th className={thCls}>Website</th><th className={thCls} /></tr>
          </thead>
          <tbody>
            {pageRows.map(r => (
              <tr key={r.id ?? `${r.country}-${r.name}`} className="border-b border-gold/10 last:border-0">
                <td className={tdCls}>
                  <div className="flex items-center gap-3">
                    <UniversityLogo name={r.name} logo={r.logo} tone="light" />
                    <span className="font-semibold text-navy">{r.name}</span>
                  </div>
                </td>
                <td className={tdCls}>{r.country}</td>
                <td className={tdCls}>{r.continent.name}</td>
                <td className={`${tdCls} max-w-[220px] truncate`}>
                  {r.website
                    ? <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-navy">{r.website.replace(/^https?:\/\//, '')}</a>
                    : <span className="text-navy/35">—</span>}
                </td>
                <td className={`${tdCls} whitespace-nowrap text-right`}>
                  <button type="button" disabled={!canEdit} onClick={() => open(r.id!)} className={btnGhost}>Edit</button>{' '}
                  <button type="button" disabled={!canEdit} className={btnDanger}
                    onClick={() => confirmAndDelete(`Delete ${r.name} (${r.country})?`,
                      () => adminRequest('DELETE', `/api/admin/universities/${r.id}`, actor))}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-[13px] text-navy/45">No universities match.</p>}
      </div>
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-[13px] text-navy/60">
          <button type="button" disabled={page === 1} onClick={() => setPage(p => p - 1)} className={btnGhost}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button type="button" disabled={page === pages} onClick={() => setPage(p => p + 1)} className={btnGhost}>Next</button>
        </div>
      )}

      <AnimatePresence>
        {editor.editing && (
          <Modal title={editor.editing === 'new' ? 'Add university' : `Edit ${rows.find(r => r.id === editor.editing)?.name ?? 'university'}`}
            onClose={editor.close}>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label="Name"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
              <div>
                <p className="mb-1.5 text-[12px] font-semibold text-navy/55">Country</p>
                <SearchableSelect tone="light" value={form.countryId} placeholder="Choose a country…"
                  searchPlaceholder="Search countries…" options={formCountryOptions}
                  onChange={v => setForm({ ...form, countryId: v })} />
              </div>
              <Field label="Website link (optional)" hint="Shown as “Visit website” in the directory. Include https://">
                <input type="url" className={inputCls} value={form.website} placeholder="https://www.example.edu"
                  onChange={e => setForm({ ...form, website: e.target.value })} />
              </Field>
              <LogoField name={form.name} value={form.logo} actor={actor} onChange={logo => setForm({ ...form, logo })} />
              <FormActions error={editor.error} saving={editor.saving} onCancel={editor.close}
                submitLabel={editor.editing === 'new' ? 'Add university' : 'Save changes'} />
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Panel ──────────────────────────────────────────────────────────────── */

export type MasterView = 'continents' | 'countries' | 'universities'

const VIEW_INFO: Record<MasterView, { title: string; blurb: string }> = {
  continents: { title: 'Continents', blurb: 'Regions shown as cards on the landing page, with each one’s top 5 universities.' },
  countries: { title: 'Countries', blurb: 'Countries within each continent, used to filter the university directory.' },
  universities: { title: 'Universities', blurb: 'Every university listed in the directory, with its logo and website.' },
}

// Shown inside the admin layout; the sidebar menu chooses which master is open
export default function AtlasMasters({ view }: { view: MasterView }) {
  const { atlas, source, error } = useAtlasState()
  const { user } = useAuth()
  const actor = user ? `${user.name} <${user.email}>` : 'unknown admin'
  const canEdit = source === 'db'

  return (
    <div>
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-navy/40">Masters / {VIEW_INFO[view].title}</p>
        <h1 className="mt-1 font-display text-[26px] font-bold leading-tight text-navy md:text-[30px]" style={{ letterSpacing: '-0.5px' }}>
          {VIEW_INFO[view].title}
        </h1>
        <p className="mt-1 text-[14px] text-navy/45">{VIEW_INFO[view].blurb}</p>
      </div>

      {source === 'loading' && (
        <p className="mb-6 rounded-xl border border-gold/20 bg-white px-4 py-3 text-[13px] text-navy/55">Loading from the database…</p>
      )}
      {source === 'static' && (
        <p className="mb-6 rounded-xl border border-gold/20 bg-gold-pale px-4 py-3 text-[13px] text-navy/70">
          This site is running on the static data snapshot (production mode), so the masters are read-only.
          Make changes in development with the database, then run <code className="font-semibold">npm run db:export</code> and rebuild.
        </p>
      )}
      {source === 'fallback' && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error ?? 'The database is not reachable.'} Showing the bundled spreadsheet data read-only; editing is
          disabled until the database is back.
        </p>
      )}

      {view === 'continents' && <ContinentsMaster atlas={atlas} canEdit={canEdit} actor={actor} />}
      {view === 'countries' && <CountriesMaster atlas={atlas} canEdit={canEdit} actor={actor} />}
      {view === 'universities' && <UniversitiesMaster atlas={atlas} canEdit={canEdit} actor={actor} />}
    </div>
  )
}
