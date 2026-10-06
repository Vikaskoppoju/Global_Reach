'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MOCK_APPLICATIONS } from '@/lib/mockApplications'
import AtlasMasters from '@/components/admin/AtlasMasters'
import AdminSidebar, { type AdminView } from '@/components/admin/AdminSidebar'
import ActivityLog from '@/components/admin/ActivityLog'
import scholarshipsData from '@/lib/scholarships.json'
import type { Application, AppStatus, Scholarship } from '@/types'

/* ─── Constants ─────────────────────────────────────────── */
const ALL_STATUSES: AppStatus[] = ['Pending', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected']

const STATUS_STYLE: Record<AppStatus, { pill: string; dot: string }> = {
  'Pending':      { pill: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-400'  },
  'Under Review': { pill: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500'   },
  'Shortlisted':  { pill: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  'Accepted':     { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Rejected':     { pill: 'bg-red-50 text-red-600 border-red-200',          dot: 'bg-red-400'    },
}

const PER_PAGE = 12

interface ScholarshipFormState {
  name: string
  provider: string
  country: string
  region: string
  flag: string
  imageUrl: string
  levels: string
  fields: string
  amount: string
  amountUSD: number
  deadline: string
  duration: string
  description: string
  benefits: string
  tags: string
  link: string
  minGPA: number
  minPercentage: number
  minMarks: number
  exams: string
}

const blankScholarshipForm: ScholarshipFormState = {
  name: '',
  provider: 'GlobalReach',
  country: 'International',
  region: 'Global',
  flag: '',
  imageUrl: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80',
  levels: "Master's",
  fields: 'All Fields',
  amount: 'Full funding',
  amountUSD: 0,
  deadline: new Date().toISOString().slice(0, 10),
  duration: '1 year',
  description: '',
  benefits: 'Full tuition, Living stipend, Travel support',
  tags: 'fully-funded',
  link: 'https://',
  minGPA: 3,
  minPercentage: 75,
  minMarks: 750,
  exams: 'IELTS, TOEFL',
}

const parseList = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean)

/* ─── Helper: format score ──────────────────────────────── */
function formatScore(a: Application): string {
  if (!a.marksInput) return '—'
  const m = a.marksInput
  if (m.mode === 'gpa')        return `${(m.gpa ?? 0).toFixed(1)} GPA`
  if (m.mode === 'percentage') return `${m.percentage ?? 0}%`
  if (m.mode === 'marks' && m.marksMax) return `${m.marks ?? 0} / ${m.marksMax}`
  return '—'
}

/* ─── Stat Card ─────────────────────────────────────────── */
function StatCard({ label, value, border }: { label: string; value: number; border: string }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border ${border} flex items-center gap-4`}>
      <div>
        <div className="text-[12px] text-navy/45 font-medium mb-0.5">{label}</div>
        <div className="font-display font-bold text-navy text-[26px] leading-none">{value}</div>
      </div>
    </div>
  )
}

/* ─── Main Component ────────────────────────────────────── */
export default function AdminDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  const [view, setView] = useState<AdminView>('applications')
  const [apps,         setApps]         = useState<Application[]>(MOCK_APPLICATIONS)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'All'>('All')
  const [destFilter,   setDestFilter]   = useState('All')
  const [levelFilter,  setLevelFilter]  = useState('All')
  const [fieldFilter,  setFieldFilter]  = useState('All')
  const [sortKey,      setSortKey]      = useState<'date' | 'name' | 'score'>('date')
  const [selected,     setSelected]     = useState<Application | null>(null)
  const [page,         setPage]         = useState(1)
  const [editNote,     setEditNote]     = useState('')
  const [scholarships, setScholarships] = useState<Scholarship[]>(scholarshipsData as Scholarship[])
  const [customScholarships, setCustomScholarships] = useState<Scholarship[]>([])
  const [scholarshipSearch, setScholarshipSearch] = useState('')
  const [scholarshipModalOpen, setScholarshipModalOpen] = useState(false)
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null)
  const [isEditingScholarship, setIsEditingScholarship] = useState(false)
  const [scholarshipForm, setScholarshipForm] = useState<ScholarshipFormState>(blankScholarshipForm)

  const mergeScholarships = (custom: Scholarship[]) => {
    const customIds = new Set(custom.map(s => s.id))
    return [...custom, ...scholarshipsData.filter(s => !customIds.has(s.id))]
  }

  // The open section lives in ?view= so refreshes and shared links land on the same screen
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('view')
    if (v === 'continents' || v === 'countries' || v === 'universities' || v === 'activity') setView(v)
  }, [])

  const selectView = (next: AdminView) => {
    setView(next)
    window.history.replaceState(null, '', next === 'applications' ? '/admin' : `/admin?view=${next}`)
    window.scrollTo({ top: 0 })
  }

  // Guard: admin only
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gr_custom_scholarships')
      if (stored) {
        const custom = JSON.parse(stored) as Scholarship[]
        setCustomScholarships(custom)
        setScholarships(mergeScholarships(custom))
      }
    } catch {
      // ignore invalid local storage data
    }
  }, [])

  // Derived filter options
  const destinations = useMemo(() => ['All', ...Array.from(new Set(apps.map(a => a.destination))).sort()], [apps])
  const levels       = useMemo(() => ['All', ...Array.from(new Set(apps.map(a => a.studyLevel))).sort()],  [apps])
  const fields       = useMemo(() => ['All', ...Array.from(new Set(apps.map(a => a.fieldOfStudy))).sort()], [apps])

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let list = apps.filter(a => {
      const q = search.toLowerCase()
      if (q && !`${a.firstName} ${a.lastName} ${a.email} ${a.id} ${a.nationality}`.toLowerCase().includes(q)) return false
      if (statusFilter !== 'All' && a.status !== statusFilter) return false
      if (destFilter   !== 'All' && a.destination !== destFilter) return false
      if (levelFilter  !== 'All' && a.studyLevel  !== levelFilter) return false
      if (fieldFilter  !== 'All' && a.fieldOfStudy !== fieldFilter) return false
      return true
    })
    if (sortKey === 'date') list = [...list].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    if (sortKey === 'name') list = [...list].sort((a, b) => `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`))
    return list
  }, [apps, search, statusFilter, destFilter, levelFilter, fieldFilter, sortKey])

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  // Stats
  const stats = {
    total:       apps.length,
    pending:     apps.filter(a => a.status === 'Pending').length,
    review:      apps.filter(a => a.status === 'Under Review').length,
    shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
    accepted:    apps.filter(a => a.status === 'Accepted').length,
    rejected:    apps.filter(a => a.status === 'Rejected').length,
  }

  const updateStatus = (id: string, status: AppStatus) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev)
  }

  const saveNote = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, notes: editNote } : a))
    setSelected(prev => prev?.id === id ? { ...prev, notes: editNote } : prev)
  }

  const saveScholarship = () => {
    const scholarship: Scholarship = {
      id: isEditingScholarship && selectedScholarship ? selectedScholarship.id : `custom-${Date.now()}`,
      name: scholarshipForm.name.trim() || 'New Scholarship',
      provider: scholarshipForm.provider.trim() || 'GlobalReach',
      country: scholarshipForm.country.trim() || 'International',
      region: scholarshipForm.region.trim() || 'Global',
      flag: '',
      imageUrl: scholarshipForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80',
      levels: parseList(scholarshipForm.levels),
      fields: parseList(scholarshipForm.fields),
      amount: scholarshipForm.amount.trim() || 'TBD',
      amountUSD: Number(scholarshipForm.amountUSD) || 0,
      deadline: scholarshipForm.deadline,
      duration: scholarshipForm.duration.trim() || '1 year',
      description: scholarshipForm.description.trim() || 'No description available.',
      benefits: parseList(scholarshipForm.benefits),
      requirements: {
        minGPA: Number(scholarshipForm.minGPA) || 0,
        minPercentage: Number(scholarshipForm.minPercentage) || 0,
        minMarks: Number(scholarshipForm.minMarks) || 0,
        exams: parseList(scholarshipForm.exams),
        minIELTS: null,
        minTOEFL: null,
        nationality: ['All nationalities'],
        ageLimit: null,
      },
      tags: parseList(scholarshipForm.tags),
      link: scholarshipForm.link.trim() || '#',
    }

    const nextCustom = isEditingScholarship
      ? customScholarships.some(s => s.id === scholarship.id)
        ? customScholarships.map(s => s.id === scholarship.id ? scholarship : s)
        : [scholarship, ...customScholarships]
      : [scholarship, ...customScholarships]

    setCustomScholarships(nextCustom)
    setScholarships(mergeScholarships(nextCustom))
    localStorage.setItem('gr_custom_scholarships', JSON.stringify(nextCustom))
    setScholarshipModalOpen(false)
    setScholarshipForm(blankScholarshipForm)
    setSelectedScholarship(null)
    setIsEditingScholarship(false)
  }

  const openDetail = (app: Application) => {
    setSelected(app)
    setEditNote(app.notes ?? '')
  }

  const resetFilters = () => {
    setSearch(''); setStatusFilter('All'); setDestFilter('All')
    setLevelFilter('All'); setFieldFilter('All'); setPage(1)
  }

  const openAddScholarship = () => {
    setScholarshipForm(blankScholarshipForm)
    setSelectedScholarship(null)
    setIsEditingScholarship(false)
    setScholarshipModalOpen(true)
  }

  const openEditScholarship = (scholarship: Scholarship) => {
    setScholarshipForm({
      ...scholarship,
      levels: scholarship.levels.join(', '),
      fields: scholarship.fields.join(', '),
      benefits: scholarship.benefits.join(', '),
      exams: scholarship.requirements.exams.join(', '),
      tags: scholarship.tags.join(', '),
      minGPA: scholarship.requirements.minGPA ?? 0,
      minPercentage: scholarship.requirements.minPercentage ?? 0,
      minMarks: scholarship.requirements.minMarks ?? 0,
    })
    setSelectedScholarship(scholarship)
    setIsEditingScholarship(true)
    setScholarshipModalOpen(true)
  }

  const selCls = 'px-3 py-2 rounded-xl border border-gold/20 text-[13px] text-navy outline-none focus:border-gold bg-white transition-all cursor-pointer'

  if (loading || !user) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <span className="text-[13px] text-navy/50">Loading dashboard…</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F7F5F0]">

      {/* ── Top bar ── */}
      <div className="bg-navy sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between px-5 md:px-8 py-3.5">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display font-bold text-white text-[18px]">
              Global<span className="text-gold">Reach</span>
            </Link>
            <span className="text-white/25 hidden sm:block">|</span>
            <span className="text-white/55 text-[13px] font-medium hidden sm:block">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/8 rounded-full px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-navy text-[10px] font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="text-white/70 text-[13px]">{user.name}</span>
              <span className="text-[10px] font-bold bg-gold/25 text-gold px-1.5 py-0.5 rounded-full">ADMIN</span>
            </div>
            <Link href="/" className="text-[12px] text-white/55 hover:text-white/80 border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-lg transition-all">
              ← Home
            </Link>
            <button onClick={() => { logout(); router.push('/') }}
              className="text-[12px] text-white/55 hover:text-white border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-lg transition-all">
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
      <AdminSidebar view={view} onSelect={selectView} />

      <main className="flex-1 min-w-0 px-5 md:px-8 py-8">
      <div className="max-w-[1280px] mx-auto">

        {(view === 'continents' || view === 'countries' || view === 'universities') && <AtlasMasters view={view} />}

        {view === 'activity' && <ActivityLog />}

        {view === 'applications' && (<>

        {/* Page header */}
        <div className="mb-7">
          <h1 className="font-display font-bold text-navy text-[26px] md:text-[30px] leading-tight"
            style={{ letterSpacing: '-0.5px' }}>
            Applications Overview
          </h1>
          <p className="text-navy/45 text-[14px] mt-1">
            Review, filter, and manage all incoming scholarship applications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button onClick={openAddScholarship}
            className="px-4 py-3 rounded-2xl bg-gold text-navy font-semibold transition hover:bg-gold/90">
            + Add Scholarship
          </button>
          <div className="rounded-2xl border border-gold/15 bg-white px-4 py-3 text-[13px] text-navy">
            {scholarships.length} scholarships · {customScholarships.length} edited/custom
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard label="Total"       value={stats.total}       border="border-gold/20" />
          <StatCard label="Pending"     value={stats.pending}     border="border-amber-200" />
          <StatCard label="In Review"   value={stats.review}      border="border-blue-200" />
          <StatCard label="Shortlisted" value={stats.shortlisted} border="border-violet-200" />
          <StatCard label="Accepted"    value={stats.accepted}    border="border-emerald-200" />
          <StatCard label="Rejected"    value={stats.rejected}    border="border-red-200" />
        </div>

        {/* ── Filter / search bar ── */}
        <div className="bg-white rounded-2xl border border-gold/15 p-4 mb-5">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-4-4" />
              </svg>
              <input
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gold/20 text-[13px] text-navy outline-none focus:border-gold transition-all"
                placeholder="Search name, email, ID, nationality…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>

            {/* Dropdowns */}
            <select className={selCls} value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as AppStatus | 'All'); setPage(1) }}>
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className={selCls} value={destFilter}
              onChange={e => { setDestFilter(e.target.value); setPage(1) }}>
              {destinations.map(d => <option key={d}>{d}</option>)}
            </select>
            <select className={selCls} value={levelFilter}
              onChange={e => { setLevelFilter(e.target.value); setPage(1) }}>
              {levels.map(l => <option key={l}>{l}</option>)}
            </select>
            <select className={selCls} value={fieldFilter}
              onChange={e => { setFieldFilter(e.target.value); setPage(1) }}>
              {fields.map(f => <option key={f}>{f}</option>)}
            </select>
            <select className={selCls} value={sortKey}
              onChange={e => setSortKey(e.target.value as 'date' | 'name' | 'score')}>
              <option value="date">Sort: Newest</option>
              <option value="name">Sort: Name A–Z</option>
            </select>

            {/* Result count + clear */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-[13px] text-navy/40 whitespace-nowrap">{filtered.length} results</span>
              {(search || statusFilter !== 'All' || destFilter !== 'All' || levelFilter !== 'All' || fieldFilter !== 'All') && (
                <button onClick={resetFilters}
                  className="text-[12px] font-semibold text-gold hover:text-navy border border-gold/30 px-3 py-1.5 rounded-lg transition-all">
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gold/15 p-5 mb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold text-navy text-[18px]">Scholarship Catalog</h2>
              <p className="text-[13px] text-navy/50">Manage the scholarships shown on the public scholarships page.</p>
            </div>
            <div className="text-[13px] text-navy/45">
              {scholarships.length} total · {customScholarships.length} edited/custom
            </div>
          </div>
          <div className="grid gap-3">
            {scholarships.slice(0, 5).map(s => (
              <div key={s.id} className="rounded-2xl border border-gold/15 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-semibold text-navy">{s.name}</div>
                  <div className="text-[12px] text-navy/50">{s.provider} · {s.country} · {s.region}</div>
                </div>
                <button type="button" onClick={() => openEditScholarship(s)}
                  className="rounded-2xl bg-gold/10 text-gold px-4 py-2 text-[12px] font-semibold hover:bg-gold/20 transition-all">
                  Edit
                </button>
              </div>
            ))}
            {scholarships.length > 5 && (
              <div className="text-[13px] text-navy/50">Showing first 5 scholarships. Use the public scholarships page to browse all entries.</div>
            )}
          </div>
        </div>

        {/* ── Data table ── */}
        <div className="bg-white rounded-2xl border border-gold/15 overflow-hidden mb-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10 bg-navy/[0.02]">
                  {['ID', 'Applicant', 'Field', 'Destination', 'Level', 'Score', 'Status', 'Submitted', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-navy/45 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-navy/40 text-[14px]">
                      No applications match your filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((app, i) => (
                    <motion.tr key={app.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      className="border-b border-gold/8 hover:bg-amber-50/40 transition-colors cursor-pointer"
                      onClick={() => openDetail(app)}>

                      <td className="px-4 py-3 font-mono text-[11px] text-navy/40 whitespace-nowrap">{app.id}</td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-navy text-[13px]">{app.firstName} {app.lastName}</div>
                        <div className="text-[11px] text-navy/40 truncate max-w-[140px]">{app.email}</div>
                        <div className="text-[11px] text-navy/35 mt-0.5">{app.nationality}</div>
                      </td>

                      <td className="px-4 py-3 text-[13px] text-navy/65 max-w-[120px]">
                        <div className="truncate">{app.fieldOfStudy}</div>
                      </td>

                      <td className="px-4 py-3 text-[13px] text-navy/65 whitespace-nowrap">{app.destination}</td>
                      <td className="px-4 py-3 text-[13px] text-navy/65 whitespace-nowrap">{app.studyLevel}</td>

                      <td className="px-4 py-3 font-bold text-[13px] text-navy whitespace-nowrap">{formatScore(app)}</td>

                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[app.status].pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[app.status].dot}`} />
                          {app.status}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-[12px] text-navy/45 whitespace-nowrap">
                        {new Date(app.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>

                      {/* Inline status dropdown */}
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <select value={app.status}
                          onChange={e => updateStatus(app.id, e.target.value as AppStatus)}
                          className="text-[11px] border border-gold/20 rounded-lg px-2.5 py-1.5 bg-cream text-navy outline-none focus:border-gold cursor-pointer transition-all">
                          {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3.5 border-t border-gold/10 gap-3">
            <span className="text-[12px] text-navy/40">
              Page {page} of {totalPages} · {filtered.length} application{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-[12px] border border-gold/20 rounded-lg text-navy/60 hover:border-gold hover:text-navy disabled:opacity-30 transition-all">
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pg => pg === 1 || pg === totalPages || Math.abs(pg - page) <= 1)
                .reduce<(number | '…')[]>((acc, pg, i, arr) => {
                  if (i > 0 && pg - (arr[i - 1] as number) > 1) acc.push('…')
                  acc.push(pg); return acc
                }, [])
                .map((pg, i) =>
                  pg === '…'
                    ? <span key={`e${i}`} className="text-navy/30 text-[12px] px-1">…</span>
                    : <button key={pg} onClick={() => setPage(pg as number)}
                        className={`w-8 h-8 text-[12px] font-semibold rounded-lg border transition-all
                          ${pg === page ? 'bg-navy text-white border-navy' : 'border-gold/20 text-navy/60 hover:border-gold hover:text-navy'}`}>
                        {pg}
                      </button>
                )}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-[12px] border border-gold/20 rounded-lg text-navy/60 hover:border-gold hover:text-navy disabled:opacity-30 transition-all">
                Next →
              </button>
            </div>
          </div>
        </div>

        </>)}

      </div>
      </main>
      </div>{/* /main container */}

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(15,31,61,0.72)', backdropFilter: 'blur(10px)' }}
            onClick={() => setSelected(null)}>

            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto sm:rounded-[28px] rounded-t-[28px] shadow-2xl">

              {/* Modal header */}
              <div className="bg-navy sm:rounded-t-[28px] rounded-t-[28px] p-7 relative">
                <button onClick={() => setSelected(null)}
                  className="absolute top-5 right-5 w-9 h-9 bg-white/10 hover:bg-white/20 text-white
                    rounded-full flex items-center justify-center text-xl transition-all">
                  ×
                </button>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center text-navy font-display font-bold text-xl flex-shrink-0">
                    {selected.firstName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-gold text-[11px] font-bold uppercase tracking-[1.5px] mb-1">{selected.id}</div>
                    <h2 className="font-display font-bold text-white text-[22px] leading-tight">
                      {selected.firstName} {selected.lastName}
                    </h2>
                    <p className="text-white/50 text-[13px] mt-1">{selected.email}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full border ${STATUS_STYLE[selected.status].pill}`}>
                    <span className={`w-2 h-2 rounded-full ${STATUS_STYLE[selected.status].dot}`} />
                    {selected.status}
                  </span>
                  <span className="text-[12px] text-white/50 bg-white/8 px-3 py-1.5 rounded-full">
                    {selected.nationality}
                  </span>
                  <span className="text-[12px] text-white/50 bg-white/8 px-3 py-1.5 rounded-full">
                    {new Date(selected.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="p-7">
                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
                  {[
                    { label: 'Destination',  value: selected.destination    },
                    { label: 'Study Level',  value: selected.studyLevel     },
                    { label: 'Score',        value: formatScore(selected)   },
                    { label: 'Nationality',  value: selected.nationality    },
                    { label: 'Field',        value: selected.fieldOfStudy   },
                    { label: 'Qualification',value: selected.qualification  },
                    { label: 'Exams',        value: selected.selectedTests.length ? selected.selectedTests.join(', ') : 'Not specified' },
                    { label: 'Admission',    value: selected.admissionStatus || 'Not specified' },
                    { label: 'DOB',          value: selected.dob            },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#F7F5F0] rounded-xl p-3.5">
                      <div className="text-[10px] font-bold text-navy/35 uppercase tracking-wide mb-1">{label}</div>
                      <div className="text-[13px] font-semibold text-navy leading-snug">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Statements */}
                <div className="flex flex-col gap-4 mb-7">
                  <div>
                    <h4 className="font-bold text-navy text-[13px] mb-2 flex items-center gap-2">
                      Personal Statement
                    </h4>
                    <p className="text-[13px] text-navy/60 leading-relaxed bg-[#F7F5F0] rounded-xl p-4">
                      {selected.personalStatement}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-[13px] mb-2 flex items-center gap-2">
                      Financial Need Statement
                    </h4>
                    <p className="text-[13px] text-navy/60 leading-relaxed bg-[#F7F5F0] rounded-xl p-4">
                      {selected.financialStatement}
                    </p>
                  </div>
                </div>

                {/* Status update */}
                <div className="mb-6">
                  <h4 className="font-bold text-navy text-[13px] mb-3">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map(s => (
                      <button key={s} onClick={() => updateStatus(selected.id, s)}
                        className={`px-4 py-2 text-[12px] font-bold rounded-xl border transition-all
                          ${selected.status === s
                            ? STATUS_STYLE[s].pill + ' scale-[1.03] shadow-sm'
                            : 'border-navy/10 text-navy/50 hover:border-navy/25 hover:text-navy'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin notes */}
                <div>
                  <h4 className="font-bold text-navy text-[13px] mb-2">Admin Notes</h4>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border border-gold/20 bg-[#F7F5F0] text-[13px] text-navy
                      outline-none focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/10 transition-all resize-y min-h-[80px]"
                    placeholder="Add internal notes about this application…"
                    value={editNote}
                    onChange={e => setEditNote(e.target.value)} />
                  <button onClick={() => saveNote(selected.id)}
                    className="mt-2 px-5 py-2 bg-navy text-white text-[13px] font-semibold rounded-xl
                      hover:bg-navy-mid transition-all hover:-translate-y-0.5">
                    Save Note
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scholarshipModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(15,31,61,0.72)', backdropFilter: 'blur(10px)' }}
            onClick={() => setScholarshipModalOpen(false)}>

            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-[28px] shadow-2xl">

              <div className="bg-navy sm:rounded-t-[28px] rounded-t-[28px] p-7 relative">
                <button onClick={() => setScholarshipModalOpen(false)}
                  className="absolute top-5 right-5 w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center text-xl transition-all">
                  ×
                </button>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[2px] text-gold mb-2">Scholarship Management</div>
                  <h2 className="font-display font-bold text-white text-[24px] md:text-[28px] leading-tight">
                    {isEditingScholarship ? 'Edit scholarship entry' : 'Add a new scholarship to the site'}
                  </h2>
                  <p className="text-white/60 mt-2 max-w-2xl">
                    {isEditingScholarship ? 'Update the existing scholarship and keep changes in local storage.' : 'New scholarships created here will appear in the public scholarship database.'}
                  </p>
                </div>
              </div>

              <div className="p-7 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-[12px] text-navy/50">
                    Scholarship name
                    <input value={scholarshipForm.name} onChange={e => setScholarshipForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Provider
                    <input value={scholarshipForm.provider} onChange={e => setScholarshipForm(prev => ({ ...prev, provider: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Country
                    <input value={scholarshipForm.country} onChange={e => setScholarshipForm(prev => ({ ...prev, country: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Region
                    <input value={scholarshipForm.region} onChange={e => setScholarshipForm(prev => ({ ...prev, region: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Image URL
                    <input value={scholarshipForm.imageUrl} onChange={e => setScholarshipForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-[12px] text-navy/50">
                    Levels (comma-separated)
                    <input value={scholarshipForm.levels} onChange={e => setScholarshipForm(prev => ({ ...prev, levels: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Fields (comma-separated)
                    <input value={scholarshipForm.fields} onChange={e => setScholarshipForm(prev => ({ ...prev, fields: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Tags (comma-separated)
                    <input value={scholarshipForm.tags} onChange={e => setScholarshipForm(prev => ({ ...prev, tags: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Deadline
                    <input type="date" value={scholarshipForm.deadline} onChange={e => setScholarshipForm(prev => ({ ...prev, deadline: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-[12px] text-navy/50">
                    Amount label
                    <input value={scholarshipForm.amount} onChange={e => setScholarshipForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Amount USD
                    <input type="number" value={scholarshipForm.amountUSD} onChange={e => setScholarshipForm(prev => ({ ...prev, amountUSD: Number(e.target.value) }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-[12px] text-navy/50">
                    Duration
                    <input value={scholarshipForm.duration} onChange={e => setScholarshipForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Link
                    <input value={scholarshipForm.link} onChange={e => setScholarshipForm(prev => ({ ...prev, link: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                </div>

                <label className="block text-[12px] text-navy/50">
                  Description
                  <textarea value={scholarshipForm.description} onChange={e => setScholarshipForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-2 w-full min-h-[120px] rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 resize-y" />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-[12px] text-navy/50">
                    Benefits (comma-separated)
                    <textarea value={scholarshipForm.benefits} onChange={e => setScholarshipForm(prev => ({ ...prev, benefits: e.target.value }))}
                      className="mt-2 w-full min-h-[80px] rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 resize-y" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Exams (comma-separated)
                    <textarea value={scholarshipForm.exams} onChange={e => setScholarshipForm(prev => ({ ...prev, exams: e.target.value }))}
                      className="mt-2 w-full min-h-[80px] rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10 resize-y" />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block text-[12px] text-navy/50">
                    Min GPA
                    <input type="number" step="0.1" value={scholarshipForm.minGPA} onChange={e => setScholarshipForm(prev => ({ ...prev, minGPA: Number(e.target.value) }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Min %
                    <input type="number" value={scholarshipForm.minPercentage} onChange={e => setScholarshipForm(prev => ({ ...prev, minPercentage: Number(e.target.value) }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                  <label className="block text-[12px] text-navy/50">
                    Min Marks
                    <input type="number" value={scholarshipForm.minMarks} onChange={e => setScholarshipForm(prev => ({ ...prev, minMarks: Number(e.target.value) }))}
                      className="mt-2 w-full rounded-2xl border border-gold/20 px-4 py-3 text-[13px] text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/10" />
                  </label>
                </div>

                <div className="flex flex-wrap gap-3 justify-end">
                  <button type="button" onClick={() => setScholarshipModalOpen(false)}
                    className="px-5 py-3 rounded-2xl border border-navy/15 text-[13px] text-navy hover:border-navy/30 transition-all">
                    Cancel
                  </button>
                  <button type="button" onClick={saveScholarship}
                    className="px-5 py-3 rounded-2xl bg-gold text-navy font-semibold hover:bg-gold/90 transition-all">
                    {isEditingScholarship ? 'Save Changes' : 'Save Scholarship'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
