'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import ScholarshipCard from '@/components/ui/ScholarshipCard'
import ScholarshipModal from '@/components/ui/ScholarshipModal'
import {
  FIELD_GROUPS, FUNDING, LEVELS, compareDeadlines, examName, isAllFields, matchesFieldGroup, meetsGrade,
  universityMatch, useScholarships, type StudentScore,
} from '@/lib/scholarships'
import { useCountryContinents, useUniversityLogos } from '@/lib/atlas'
import type { MarksMode, Scholarship } from '@/types'

const PAGE_SIZE = 24

type SortBy = 'deadline' | 'amount' | 'name'

interface Filters {
  search: string
  continent: string
  country: string
  level: string
  field: string
  // Hide scholarships open to all fields when a field is chosen
  fieldOnly: boolean
  exam: string
  funding: string
  sortBy: SortBy
}

const EMPTY: Filters = { search: '', continent: '', country: '', level: '', field: '', fieldOnly: false, exam: '', funding: '', sortBy: 'deadline' }

interface GradeInput { mode: MarksMode; gpa: string; percentage: string; marks: string; marksMax: string }

const EMPTY_GRADE: GradeInput = { mode: 'percentage', gpa: '', percentage: '', marks: '', marksMax: '1000' }

// The student's grade as GPA (out of 4) and percentage; null until something valid is entered
function toScore(g: GradeInput): StudentScore | null {
  if (g.mode === 'gpa') {
    const gpa = parseFloat(g.gpa)
    return gpa > 0 && gpa <= 4 ? { gpa, percentage: gpa * 25 } : null
  }
  const pct = g.mode === 'percentage'
    ? parseFloat(g.percentage)
    : (parseFloat(g.marks) / parseFloat(g.marksMax)) * 100
  return pct > 0 && pct <= 100 ? { gpa: pct / 25, percentage: pct } : null
}

const selCls = 'w-full px-3 py-2.5 rounded-xl border border-gold/20 bg-white text-[13px] text-navy outline-none focus:border-gold transition-all'
const labelCls = 'text-[11px] font-bold text-navy/50 uppercase tracking-wide block mb-1.5'

function Select({ id, label, value, onChange, options, any }: {
  id: string; label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; any: string
}) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <select id={id} className={selCls} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{any}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export default function ScholarshipDirectory() {
  const scholarships = useScholarships()
  const logos = useUniversityLogos()
  const continentOf = useCountryContinents()
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [grade, setGrade] = useState<GradeInput>(EMPTY_GRADE)
  // Set from /scholarships?university=…&country=… (the university directory links here)
  const [university, setUniversity] = useState<{ name: string; country: string } | null>(null)
  const [selected, setSelected] = useState<Scholarship | null>(null)
  const [shown, setShown] = useState(PAGE_SIZE)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const name = params.get('university')
    const country = params.get('country')
    const level = params.get('level')
    if (name && country) setUniversity({ name, country })
    else if (country) setFilters(f => ({ ...f, country }))
    if (level && LEVELS.includes(level)) setFilters(f => ({ ...f, level }))
  }, [])

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters(f => ({ ...f, [key]: value }))

  // Option lists come from the data, with the number of scholarships for each
  const options = useMemo(() => {
    const count = (values: string[]) => {
      const counts = new Map<string, number>()
      values.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1))
      return counts
    }
    const studyCountries = count(scholarships.flatMap(s => s.studyIn ?? []))
    const continents = count(scholarships.flatMap(s =>
      Array.from(new Set((s.studyIn ?? []).map(c => continentOf.get(c)).filter((c): c is string => !!c)))))
    const exams = count(scholarships.flatMap(s => Array.from(new Set(s.requirements.exams.map(examName)))))
    const label = (name: string, n?: number) => `${name} (${n ?? 0})`
    return {
      continents: Array.from(continents).sort((a, b) => a[0].localeCompare(b[0]))
        .map(([c, n]) => ({ value: c, label: label(c, n) })),
      countries: Array.from(studyCountries)
        .filter(([c]) => !filters.continent || continentOf.get(c) === filters.continent)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([c, n]) => ({ value: c, label: label(c, n) })),
      levels: LEVELS.map(l => ({ value: l, label: label(l, scholarships.filter(s => s.levels.includes(l)).length) })),
      fields: FIELD_GROUPS.map(g => ({
        value: g.label,
        label: `${g.label} (${scholarships.filter(s => !isAllFields(s) && matchesFieldGroup(s, g.label)).length} specific)`,
      })),
      exams: Array.from(exams).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1])
        .map(([e, n]) => ({ value: e, label: label(e, n) })),
    }
  }, [scholarships, continentOf, filters.continent])

  const score = useMemo(() => toScore(grade), [grade])

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return scholarships.filter(s => {
      const studyIn = s.studyIn ?? []
      if (q && ![s.name, s.provider, s.country, ...studyIn, ...(s.universities ?? [])]
        .some(f => f.toLowerCase().includes(q))) return false
      if (university && !universityMatch(s, university.name, university.country)) return false
      if (filters.continent && !studyIn.some(c => continentOf.get(c) === filters.continent)) return false
      if (filters.country && !studyIn.includes(filters.country)) return false
      if (filters.level && !s.levels.includes(filters.level)) return false
      if (filters.field && !matchesFieldGroup(s, filters.field)) return false
      if (filters.field && filters.fieldOnly && isAllFields(s)) return false
      if (filters.exam && !s.requirements.exams.some(e => examName(e) === filters.exam)) return false
      if (filters.funding && !s.tags.includes(filters.funding)) return false
      if (!meetsGrade(s, score)) return false
      return true
    }).sort((a, b) => {
      if (filters.sortBy === 'amount') return b.amountUSD - a.amountUSD
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name)
      return compareDeadlines(a.deadline, b.deadline)
    })
  }, [scholarships, filters, university, continentOf, score])

  useEffect(() => setShown(PAGE_SIZE), [filters, university, grade])

  // Load the next batch when the marker below the list scrolls into view.
  // Re-runs after each batch, so if the marker is still visible it keeps loading.
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setShown(n => n + PAGE_SIZE) },
      { rootMargin: '400px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shown, filtered.length])

  const activeCount = Object.entries(filters).filter(([k, v]) => k !== 'sortBy' && k !== 'fieldOnly' && v).length
    + (university ? 1 : 0) + (score ? 1 : 0)

  const clearAll = () => {
    setFilters(f => ({ ...EMPTY, sortBy: f.sortBy }))
    setGrade(EMPTY_GRADE)
    setUniversity(null)
    window.history.replaceState(null, '', window.location.pathname)
  }

  const gradeInput = (key: 'gpa' | 'percentage' | 'marks' | 'marksMax', placeholder: string, max: number, step = 1) => (
    <input type="number" inputMode="decimal" min={0} max={max} step={step} placeholder={placeholder}
      aria-label={placeholder} value={grade[key]} onChange={e => setGrade(g => ({ ...g, [key]: e.target.value }))}
      className={selCls} />
  )

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-navy px-5 md:px-10 lg:px-16 pt-28 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, #C9A84C 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-[1200px]">
          <nav className="text-[13px] text-white/50 mb-3" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Overview</Link>
            <span className="mx-2">/</span>
            <span className="text-white/75">Scholarships</span>
          </nav>
          <h1 className="font-display font-bold text-white mb-2"
            style={{ fontSize: 'clamp(28px, 3.4vw, 40px)', letterSpacing: '-1px', lineHeight: 1.15 }}>
            Find your perfect <em className="text-gold">scholarship</em>
          </h1>
          <p className="text-white/55 text-[15px] leading-relaxed">
            Browse {scholarships.length} scholarships by where you want to study, the university, your level,
            field and grades.
          </p>
        </div>
      </div>

      <div className="px-5 md:px-10 lg:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

          {/* ─── FILTER PANEL ─── */}
          <aside className="bg-white rounded-2xl border border-gold/15 p-6 flex flex-col gap-5
            lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display font-bold text-navy text-[18px]">Filter Scholarships</h2>
              {activeCount > 0 && (
                <button type="button" onClick={clearAll} className="text-[12px] font-semibold text-gold hover:text-navy">
                  Clear ({activeCount})
                </button>
              )}
            </div>

            <div>
              <label htmlFor="sq" className={labelCls}>Search</label>
              <input id="sq" type="search" className={selCls} placeholder="Name, provider, country, university…"
                value={filters.search} onChange={e => set('search', e.target.value)} />
            </div>

            {university && (
              <div className="rounded-xl border border-gold/30 bg-gold-pale p-3 text-[12px] text-navy/70">
                Scholarships for <strong className="text-navy">{university.name}</strong>: named for it or
                open to any university in {university.country}.
                <button type="button" onClick={() => {
                  setUniversity(null)
                  window.history.replaceState(null, '', window.location.pathname)
                }}
                  className="mt-1 block font-semibold text-gold hover:text-navy transition-colors">
                  Show all scholarships
                </button>
              </div>
            )}

            <Select id="continent" label="Study region" any="Any region" value={filters.continent}
              options={options.continents}
              onChange={v => setFilters(f => ({
                ...f, continent: v,
                // Keep the country only if it is in the new region
                country: v && f.country && continentOf.get(f.country) !== v ? '' : f.country,
              }))} />

            <Select id="country" label="Study in" any={filters.continent ? `Any country in ${filters.continent}` : 'Any country'}
              value={filters.country} options={options.countries}
              onChange={v => setFilters(f => ({ ...f, country: v, continent: v ? continentOf.get(v) ?? f.continent : f.continent }))} />

            <Select id="level" label="Study level" any="Any level" value={filters.level}
              options={options.levels} onChange={v => set('level', v)} />

            <div>
              <Select id="field" label="Field of study" any="Any field" value={filters.field}
                options={options.fields} onChange={v => set('field', v)} />
              {filters.field && (
                <label className="mt-2 flex items-start gap-2 text-[12px] text-navy/60 cursor-pointer">
                  <input type="checkbox" checked={filters.fieldOnly} onChange={e => set('fieldOnly', e.target.checked)}
                    className="mt-0.5 accent-[#C9A84C]" />
                  Only scholarships specific to this field (hide those open to all fields)
                </label>
              )}
            </div>

            <Select id="exam" label="Language / admission test" any="Any test" value={filters.exam}
              options={options.exams} onChange={v => set('exam', v)} />

            <fieldset>
              <legend className={labelCls}>Funding</legend>
              <div className="flex flex-col gap-2">
                {[{ tag: '', label: 'Any funding' }, ...FUNDING].map(f => (
                  <label key={f.tag} className="flex items-center gap-2 text-[13px] text-navy/65 cursor-pointer">
                    <input type="radio" name="funding" checked={filters.funding === f.tag}
                      onChange={() => set('funding', f.tag)} className="accent-[#C9A84C]" />
                    {f.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="bg-gold-pale rounded-xl p-4 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8A6A1A] uppercase tracking-wide">Your grade</span>
              <div className="flex gap-1 bg-white rounded-lg p-1" role="group" aria-label="Grade format">
                {(['gpa', 'percentage', 'marks'] as MarksMode[]).map(m => (
                  <button key={m} type="button" onClick={() => setGrade(g => ({ ...g, mode: m }))} aria-pressed={grade.mode === m}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all ${grade.mode === m ? 'bg-navy text-white' : 'text-navy/50 hover:text-navy'}`}>
                    {m === 'gpa' ? 'GPA' : m === 'percentage' ? '%' : 'Marks'}
                  </button>
                ))}
              </div>
              {grade.mode === 'gpa' && gradeInput('gpa', 'GPA out of 4.0', 4, 0.01)}
              {grade.mode === 'percentage' && gradeInput('percentage', 'Percentage', 100)}
              {grade.mode === 'marks' && (
                <div className="grid grid-cols-2 gap-2">
                  {gradeInput('marks', 'Marks', 100000)}
                  {gradeInput('marksMax', 'Out of', 100000)}
                </div>
              )}
              <p className="text-[11px] text-navy/50 leading-relaxed">
                {score
                  ? `Hiding scholarships with a published minimum above ${score.percentage.toFixed(0)}% (${score.gpa.toFixed(2)} GPA).`
                  : 'Enter your grade to hide scholarships whose published minimum you don’t meet.'}
              </p>
            </div>

            <div>
              <label htmlFor="sort" className={labelCls}>Sort by</label>
              <select id="sort" className={selCls} value={filters.sortBy} onChange={e => set('sortBy', e.target.value as SortBy)}>
                <option value="deadline">Deadline (soonest)</option>
                <option value="amount">Amount (highest)</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
          </aside>

          {/* ─── RESULTS ─── */}
          <section aria-live="polite">
            <p className="text-[14px] text-navy/60 mb-6">
              Showing <span className="font-bold text-navy">{filtered.length}</span> of {scholarships.length} scholarships
            </p>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="font-display font-bold text-navy text-2xl mb-2">No matches found</div>
                <p className="text-navy/50 text-[14px] mb-4">Try removing a filter or choosing another country.</p>
                <button type="button" onClick={clearAll} className="btn-primary">Clear all filters</button>
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.slice(0, shown).map(s => (
                    <li key={s.id}>
                      <ScholarshipCard s={s} logos={logos} onSelect={() => setSelected(s)} />
                    </li>
                  ))}
                </ul>
                {shown < filtered.length && (
                  <div ref={sentinelRef} className="mt-8 py-4 text-center text-[13px] text-navy/40">
                    Loading more scholarships…
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      <ScholarshipModal s={selected} logos={logos} onClose={() => setSelected(null)} />
    </div>
  )
}
