'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import scholarshipsData from '@/lib/scholarships.json'
import type { Scholarship, ScholarshipFilters, MarksMode } from '@/types'

const scholarships = scholarshipsData as Scholarship[]

const ALL_REGIONS = ['All Regions', ...Array.from(new Set(scholarships.map(s => s.region))).sort()]
const ALL_LEVELS = ['All Levels', "Bachelor's", "Master's", 'PhD', 'Research', 'Postdoc', 'Vocational']
const ALL_FIELDS = ['All Fields', 'STEM', 'Medicine', 'Business', 'Law', 'Arts & Humanities', 'Social Sciences', 'Engineering', 'Environment', 'Public Policy']
const ALL_EXAMS = ['Any Exam', 'IELTS', 'TOEFL', 'GRE', 'GMAT', 'JLPT', 'TestDaF', 'SAT', 'ACT']

const STATUS_COLORS: Record<string, string> = {
  'fully-funded': 'bg-green-100 text-green-700',
  'partially-funded': 'bg-blue-100 text-blue-700',
  'need-based': 'bg-purple-100 text-purple-700',
}

const daysUntil = (deadline: string) => {
  const d = new Date(deadline)
  const now = new Date()
  return Math.ceil((d.getTime() - now.getTime()) / 86400000)
}

function deadlineBadge(deadline: string) {
  const days = daysUntil(deadline)
  if (days < 0) return <span className="text-[11px] text-red-500 font-semibold">Closed</span>
  if (days < 30) return <span className="text-[11px] text-orange-500 font-bold">⚡ {days}d left</span>
  return <span className="text-[11px] text-navy/50">{new Date(deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
}

export default function ScholarshipsPage() {
  const [filters, setFilters] = useState<ScholarshipFilters>({
    search: '', region: 'All Regions', level: 'All Levels',
    field: 'All Fields', exam: 'Any Exam', funding: '',
    minGPA: 0, marksMode: 'percentage', userPercentage: 0, userMarks: 0,
    sortBy: 'deadline',
  })
  const [selected, setSelected] = useState<Scholarship | null>(null)
  const [marksMode, setMarksMode] = useState<MarksMode>('percentage')
  const [userGPA, setUserGPA] = useState(0)
  const [userPct, setUserPct] = useState(0)
  const [userMarks, setUserMarks] = useState(0)
  const [userMarksMax, setUserMarksMax] = useState(1000)

  const pctEquiv = marksMode === 'gpa' ? (userGPA / 4) * 100
    : marksMode === 'marks' && userMarksMax > 0 ? (userMarks / userMarksMax) * 100
    : userPct

  const filtered = useMemo(() => {
    return scholarships.filter(s => {
      if (filters.search && !s.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !s.provider.toLowerCase().includes(filters.search.toLowerCase()) &&
        !s.country.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.region !== 'All Regions' && s.region !== filters.region) return false
      if (filters.level !== 'All Levels' && !s.levels.includes(filters.level)) return false
      if (filters.field !== 'All Fields' && !s.fields.includes('All Fields') && !s.fields.some(f => f.toLowerCase().includes(filters.field.toLowerCase()))) return false
      if (filters.exam !== 'Any Exam' && !s.requirements.exams.some(e => e.includes(filters.exam))) return false
      if (filters.funding && !s.tags.includes(filters.funding)) return false
      // marks filter
      if (pctEquiv > 0 && s.requirements.minPercentage && pctEquiv < s.requirements.minPercentage) return false
      return true
    }).sort((a, b) => {
      if (filters.sortBy === 'amount') return b.amountUSD - a.amountUSD
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
  }, [filters, pctEquiv])

  const setF = (key: keyof ScholarshipFilters, val: string | number) =>
    setFilters(p => ({ ...p, [key]: val }))

  const selCls = 'w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-white text-[13px] text-navy outline-none focus:border-gold transition-all'
  const inpCls = 'w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-white text-[13px] text-navy outline-none focus:border-gold transition-all'

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-navy px-5 md:px-10 lg:px-16 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, #C9A84C 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 text-[13px] hover:text-white mb-6 transition-colors">
            ← Back to GlobalReach
          </Link>
          <div className="text-gold text-[11px] font-bold tracking-[2px] uppercase mb-3">Scholarship Database</div>
          <h1 className="font-display font-bold text-white mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Find Your Perfect<br /><em className="text-gold">Scholarship</em>
          </h1>
          <p className="text-white/55 text-[16px] leading-relaxed max-w-2xl">
            Browse {scholarships.length} world-class scholarships filtered by your marks, location, level, and language exams.
          </p>
        </div>
      </div>

      <div className="px-5 md:px-10 lg:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

          {/* ─── FILTER PANEL ─── */}
          <div className="bg-white rounded-2xl border border-gold/15 p-6 lg:sticky lg:top-6 flex flex-col gap-5">
            <h2 className="font-display font-bold text-navy text-[18px]">Filter Scholarships</h2>

            {/* Search */}
            <div>
              <label className="text-[11px] font-bold text-navy/50 uppercase tracking-wide block mb-1.5">Search</label>
              <input className={inpCls} placeholder="Name, provider, country…"
                value={filters.search} onChange={e => setF('search', e.target.value)} />
            </div>

            {/* Your marks */}
            <div className="bg-gold-pale rounded-xl p-4 flex flex-col gap-3">
              <label className="text-[11px] font-bold text-[#8A6A1A] uppercase tracking-wide">Your Academic Score</label>
              <div className="flex gap-1 bg-white rounded-lg p-1">
                {(['gpa','percentage','marks'] as MarksMode[]).map(m => (
                  <button key={m} type="button" onClick={() => setMarksMode(m)}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all ${marksMode === m ? 'bg-navy text-white' : 'text-navy/50 hover:text-navy'}`}>
                    {m === 'gpa' ? 'GPA' : m === 'percentage' ? '%' : 'Marks'}
                  </button>
                ))}
              </div>
              {marksMode === 'gpa' && (
                <div>
                  <div className="flex justify-between text-[12px] mb-1"><span className="text-navy/50">GPA</span><span className="font-bold text-navy">{(userGPA / 10).toFixed(1)}</span></div>
                  <input type="range" min={0} max={40} step={1} value={userGPA} onChange={e => setUserGPA(+e.target.value)} className="w-full accent-[#C9A84C]" />
                </div>
              )}
              {marksMode === 'percentage' && (
                <div>
                  <div className="flex justify-between text-[12px] mb-1"><span className="text-navy/50">Percentage</span><span className="font-bold text-navy">{userPct}%</span></div>
                  <input type="range" min={0} max={100} step={1} value={userPct} onChange={e => setUserPct(+e.target.value)} className="w-full accent-[#C9A84C]" />
                </div>
              )}
              {marksMode === 'marks' && (
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" className={inpCls} placeholder="Marks" value={userMarks || ''} onChange={e => setUserMarks(+e.target.value)} />
                  <input type="number" className={inpCls} placeholder="Out of" value={userMarksMax || ''} onChange={e => setUserMarksMax(+e.target.value)} />
                </div>
              )}
              {pctEquiv > 0 && <p className="text-[11px] text-navy/40">Showing scholarships requiring ≤ {pctEquiv.toFixed(0)}%</p>}
            </div>

            {/* Dropdowns */}
            {[
              { label: 'Region', key: 'region', options: ALL_REGIONS },
              { label: 'Study Level', key: 'level', options: ALL_LEVELS },
              { label: 'Field of Study', key: 'field', options: ALL_FIELDS },
              { label: 'Language Exam', key: 'exam', options: ALL_EXAMS },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className="text-[11px] font-bold text-navy/50 uppercase tracking-wide block mb-1.5">{label}</label>
                <select className={selCls} value={filters[key as keyof ScholarshipFilters] as string}
                  onChange={e => setF(key as keyof ScholarshipFilters, e.target.value)}>
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}

            {/* Funding type */}
            <div>
              <label className="text-[11px] font-bold text-navy/50 uppercase tracking-wide block mb-2">Funding Type</label>
              <div className="flex flex-col gap-2">
                {[['', 'All Types'], ['fully-funded', '✅ Fully Funded'], ['partially-funded', '🔵 Partial']].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 text-[13px] text-navy/65 cursor-pointer">
                    <input type="radio" name="funding" checked={filters.funding === val}
                      onChange={() => setF('funding', val)} className="accent-[#C9A84C]" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="text-[11px] font-bold text-navy/50 uppercase tracking-wide block mb-1.5">Sort By</label>
              <select className={selCls} value={filters.sortBy} onChange={e => setF('sortBy', e.target.value as 'deadline' | 'amount' | 'name')}>
                <option value="deadline">Deadline (soonest)</option>
                <option value="amount">Amount (highest)</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>

            <button onClick={() => setFilters({ search: '', region: 'All Regions', level: 'All Levels', field: 'All Fields', exam: 'Any Exam', funding: '', minGPA: 0, marksMode: 'percentage', userPercentage: 0, userMarks: 0, sortBy: 'deadline' })}
              className="w-full py-2.5 text-[13px] font-semibold border border-navy/15 text-navy/60 rounded-xl hover:border-navy/30 hover:text-navy transition-all">
              Clear All Filters
            </button>
          </div>

          {/* ─── RESULTS ─── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[14px] text-navy/60">
                Showing <span className="font-bold text-navy">{filtered.length}</span> of {scholarships.length} scholarships
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <div className="font-display font-bold text-navy text-2xl mb-2">No matches found</div>
                <p className="text-navy/50 text-[14px]">Try adjusting your filters or lowering your marks threshold.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    onClick={() => setSelected(s)}
                    className="bg-white rounded-2xl border border-gold/12 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="relative h-36 overflow-hidden">
                      <Image src={s.imageUrl} alt={s.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-75" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                        {s.tags.slice(0, 2).map(tag => (
                          <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[tag] || 'bg-white/20 text-white'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="absolute top-3 right-3 text-2xl">{s.flag}</div>
                    </div>
                    <div className="p-5">
                      <div className="text-[11px] font-bold text-gold uppercase tracking-wide mb-1">{s.provider}</div>
                      <h3 className="font-display font-bold text-navy text-[15px] leading-tight mb-2 line-clamp-2">{s.name}</h3>
                      <p className="text-[12px] text-navy/50 leading-relaxed mb-3 line-clamp-2">{s.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                        <div>
                          <div className="text-[13px] font-bold text-navy">{s.amount}</div>
                          <div className="text-[11px] text-navy/40">{s.duration}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-semibold text-navy/50">Deadline</div>
                          {deadlineBadge(s.deadline)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {s.levels.slice(0, 3).map(l => (
                          <span key={l} className="text-[10px] bg-cream text-navy/60 px-2 py-0.5 rounded-full border border-gold/15">{l}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── DETAIL MODAL ─── */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,31,61,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[28px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="relative h-52 rounded-t-[28px] overflow-hidden">
                <Image src={selected.imageUrl} alt={selected.name} fill className="object-cover brightness-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                <button onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-lg transition-all">
                  ×
                </button>
                <div className="absolute bottom-5 left-6 right-6">
                  <div className="text-gold text-[11px] font-bold uppercase tracking-wide mb-1">{selected.provider}</div>
                  <h2 className="font-display font-bold text-white text-[22px] leading-tight">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl">{selected.flag}</span>
                    <span className="text-white/70 text-[13px]">{selected.country}</span>
                  </div>
                </div>
              </div>
              <div className="p-7">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Amount', value: selected.amount },
                    { label: 'Duration', value: selected.duration },
                    { label: 'Deadline', value: new Date(selected.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) },
                  ].map(s => (
                    <div key={s.label} className="bg-cream rounded-xl p-3 text-center">
                      <div className="text-[12px] text-navy/40 mb-1">{s.label}</div>
                      <div className="text-[13px] font-bold text-navy">{s.value}</div>
                    </div>
                  ))}
                </div>

                <p className="text-[14px] text-navy/65 leading-[1.8] mb-6">{selected.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-bold text-navy text-[14px] mb-3">✅ Benefits</h4>
                    <ul className="flex flex-col gap-2">
                      {selected.benefits.map(b => (
                        <li key={b} className="flex items-start gap-2 text-[13px] text-navy/65">
                          <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">✓</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-[14px] mb-3">📋 Requirements</h4>
                    <ul className="flex flex-col gap-2 text-[13px] text-navy/65">
                      {selected.requirements.minGPA && <li>Min GPA: <strong>{selected.requirements.minGPA}</strong></li>}
                      {selected.requirements.minPercentage && <li>Min %: <strong>{selected.requirements.minPercentage}%</strong></li>}
                      {selected.requirements.minIELTS && <li>Min IELTS: <strong>{selected.requirements.minIELTS}</strong></li>}
                      {selected.requirements.minTOEFL && <li>Min TOEFL: <strong>{selected.requirements.minTOEFL}</strong></li>}
                      {selected.requirements.ageLimit && <li>Age limit: <strong>{selected.requirements.ageLimit}</strong></li>}
                      <li>Exams: <strong>{selected.requirements.exams.join(', ')}</strong></li>
                      <li>Eligible: <strong>{selected.requirements.nationality.join(', ')}</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-1 flex-wrap mb-6">
                  {selected.levels.map(l => (
                    <span key={l} className="text-[11px] bg-navy/5 text-navy/60 px-2.5 py-1 rounded-full border border-navy/10">{l}</span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <a href={selected.link} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-3.5 bg-navy text-white font-bold text-[14px] rounded-xl text-center transition-all hover:bg-navy-mid hover:-translate-y-0.5">
                    Apply on Official Site →
                  </a>
                  <Link href="/application" onClick={() => setSelected(null)}
                    className="flex-1 py-3.5 border-2 border-gold text-gold font-bold text-[14px] rounded-xl text-center transition-all hover:bg-gold hover:text-white">
                    Apply via GlobalReach
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
