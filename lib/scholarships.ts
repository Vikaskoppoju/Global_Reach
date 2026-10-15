import { useEffect, useState } from 'react'
import scholarshipsData from '@/lib/scholarships.json'
import countryCodes from '@/lib/country-codes.json'
import type { Scholarship } from '@/types'

export const baseScholarships = scholarshipsData as Scholarship[]

// Bundled scholarships plus those added or edited in the admin (stored in this browser only).
// An admin edit keeps the original id, so it replaces the bundled entry.
export function useScholarships(): Scholarship[] {
  const [list, setList] = useState(baseScholarships)
  useEffect(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('gr_custom_scholarships') ?? '[]') as Scholarship[]
      if (!custom.length) return
      const ids = new Set(custom.map(s => s.id))
      setList([...custom, ...baseScholarships.filter(s => !ids.has(s.id))])
    } catch {
      // ignore invalid local storage data
    }
  }, [])
  return list
}

// Flag images live in public/flags (scripts/fetch-flags.mjs); null for countries without a code
export function flagUrl(country: string): string | null {
  const code = (countryCodes as Record<string, string>)[country]
  return code ? `/flags/${code}.png` : null
}

export const LEVELS = ["Bachelor's", "Master's", 'PhD', 'Research', 'Postdoc', 'Vocational']

// The data has 100+ free-text field names; the filter groups them by keyword
export const FIELD_GROUPS: { label: string; keywords: string[] }[] = [
  { label: 'Engineering & Technology', keywords: ['engineer', 'technolog', 'comput', 'data', 'stem', 'energy', 'architect', 'space', 'quantum', 'software', 'cyber', 'information', 'it', 'urban'] },
  { label: 'Natural Sciences & Maths', keywords: ['science', 'math', 'physic', 'chemi', 'biolog', 'geo', 'stem', 'quantum'] },
  { label: 'Medicine & Health', keywords: ['medic', 'health', 'disease', 'biomedical', 'nursing', 'pharma'] },
  { label: 'Business & Economics', keywords: ['business', 'econom', 'management', 'finance', 'commerce', 'agribusiness', 'mba', 'logistic', 'tourism', 'trade'] },
  { label: 'Law', keywords: ['law', 'legal', 'jd'] },
  { label: 'Arts & Humanities', keywords: ['art', 'humanit', 'culture', 'language', 'histor', 'journalism', 'media', 'communication', 'design', 'literat', 'china'] },
  { label: 'Social Sciences & Education', keywords: ['social', 'educat', 'politic', 'international', 'peace', 'development'] },
  { label: 'Public Policy & Governance', keywords: ['policy', 'public', 'governance', 'administration'] },
  { label: 'Environment & Agriculture', keywords: ['environment', 'agri', 'climate', 'sustainab', 'water', 'food', 'biodiversity', 'land'] },
]

export const isAllFields = (s: Scholarship) => s.fields.some(f => /all fields/i.test(f))

export function matchesFieldGroup(s: Scholarship, label: string) {
  if (isAllFields(s)) return true
  const group = FIELD_GROUPS.find(g => g.label === label)
  // Keywords match at word starts, so "art" matches "Arts" but not "Earth"
  return !!group && s.fields.some(f => group.keywords.some(k => new RegExp(`\\b${k}`, 'i').test(f)))
}

// "GRE (recommended)" → "GRE", "DELF B2" → "DELF"
export const examName = (exam: string) => exam.split(/[\s(]/)[0].toUpperCase().replace('TESTDAF', 'TestDaF')

export const FUNDING = [
  { tag: 'fully-funded', label: 'Fully funded' },
  { tag: 'partially-funded', label: 'Partially funded' },
  { tag: 'need-based', label: 'Need-based' },
]

export function fundingLabel(s: Scholarship) {
  return FUNDING.find(f => s.tags.includes(f.tag))?.label ?? null
}

// A student's grade as both GPA (out of 4) and percentage; null when not entered
export interface StudentScore { gpa: number; percentage: number }

// False only when the scholarship publishes a minimum the student is below
export function meetsGrade(s: Scholarship, score: StudentScore | null) {
  if (!score) return true
  const { minGPA, minPercentage } = s.requirements
  if (minGPA != null && minGPA > 0 && score.gpa < minGPA) return false
  if (minPercentage != null && minPercentage > 0 && score.percentage < minPercentage) return false
  return true
}

// How a scholarship relates to one university: named for it, or open to any university in its country
export type UniversityMatch = 'named' | 'country'

export function universityMatch(s: Scholarship, university: string, country: string): UniversityMatch | null {
  const universities = s.universities ?? []
  if (universities.includes(university)) return 'named'
  if (!universities.length && (s.studyIn ?? []).includes(country)) return 'country'
  return null
}

export function scholarshipsForUniversity(list: Scholarship[], university: string, country: string) {
  const named: Scholarship[] = []
  const countryWide: Scholarship[] = []
  for (const s of list) {
    const match = universityMatch(s, university, country)
    if (match === 'named') named.push(s)
    else if (match === 'country') countryWide.push(s)
  }
  return { named, countryWide }
}

// Deadlines are ISO dates (2026-03-31), months (2027-01) or free text ("Varies by year")
export type DeadlineInfo =
  | { kind: 'date'; date: Date; label: string; daysLeft: number }
  | { kind: 'text'; label: string }

export function deadlineInfo(deadline: string, now = new Date()): DeadlineInfo {
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deadline)
  const month = /^(\d{4})-(\d{2})$/.exec(deadline)
  if (!day && !month) return { kind: 'text', label: deadline || 'Not specified' }
  const [y, m] = [Number((day ?? month)![1]), Number((day ?? month)![2]) - 1]
  // A month-only deadline stays open until the end of that month
  const date = day ? new Date(y, m, Number(day[3])) : new Date(y, m + 1, 0)
  const label = date.toLocaleDateString('en-GB', day
    ? { day: 'numeric', month: 'short', year: 'numeric' }
    : { month: 'short', year: 'numeric' })
  return { kind: 'date', date, label, daysLeft: Math.ceil((date.getTime() - now.getTime()) / 86400000) }
}

// "Soonest deadline" order: open dated deadlines first, then undated ones, then closed ones
export function compareDeadlines(a: string, b: string, now = new Date()) {
  const rank = (d: string): [number, number] => {
    const info = deadlineInfo(d, now)
    if (info.kind === 'text') return [1, 0]
    return info.daysLeft < 0 ? [2, -info.date.getTime()] : [0, info.date.getTime()]
  }
  const [ra, ta] = rank(a)
  const [rb, tb] = rank(b)
  return ra - rb || ta - tb
}
