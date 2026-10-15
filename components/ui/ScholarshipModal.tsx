'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import UniversityLogo from '@/components/ui/UniversityLogo'
import { Flag, type LogoMap } from '@/components/ui/ScholarshipCard'
import { deadlineInfo, fundingLabel } from '@/lib/scholarships'
import type { Scholarship } from '@/types'

const show = (v: number | null | undefined) => (v ? String(v) : null)

export default function ScholarshipModal({ s, logos, onClose }: { s: Scholarship | null; logos: LogoMap; onClose: () => void }) {
  return (
    <AnimatePresence>
      {s && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,31,61,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}>
          <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
            onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="scholarship-title"
            className="bg-white rounded-[28px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative bg-navy rounded-t-[28px] px-7 pt-7 pb-6">
              <button type="button" onClick={onClose} aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 bg-white/15 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-lg transition-all">
                ×
              </button>
              <div className="text-gold text-[11px] font-bold uppercase tracking-wide mb-1 pr-10">{s.provider}</div>
              <h2 id="scholarship-title" className="font-display font-bold text-white text-[22px] leading-tight pr-10">{s.name}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-white/75">
                {(s.studyIn ?? []).length ? (s.studyIn ?? []).map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 bg-white/10 rounded-full pl-1.5 pr-3 py-1">
                    <Flag country={c} className="w-5 h-3.5" />{c}
                  </span>
                )) : <span>Various destinations</span>}
                {fundingLabel(s) && <span className="text-gold font-semibold">· {fundingLabel(s)}</span>}
              </div>
            </div>

            <div className="p-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Amount', value: s.amount },
                  { label: 'Duration', value: s.duration },
                  { label: 'Deadline', value: deadlineInfo(s.deadline).label },
                ].map(stat => (
                  <div key={stat.label} className="bg-cream rounded-xl p-3 text-center">
                    <div className="text-[12px] text-navy/40 mb-1">{stat.label}</div>
                    <div className="text-[13px] font-bold text-navy">{stat.value}</div>
                  </div>
                ))}
              </div>

              <p className="text-[14px] text-navy/65 leading-[1.8] mb-6">{s.description}</p>

              <div className="mb-6 rounded-xl border border-gold/15 p-4 text-[13px] text-navy/65">
                <h3 className="font-bold text-navy text-[14px] mb-3">Where you can use it</h3>
                {(s.universities ?? []).length > 0 ? (
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {s.universities!.map(u => (
                      <li key={u} className="flex items-center gap-2.5 min-w-0">
                        <UniversityLogo name={u} logo={logos.get(u)} tone="light" />
                        {logos.has(u) ? (
                          <Link href={`/universities?q=${encodeURIComponent(u)}`}
                            className="font-semibold text-navy hover:text-gold transition-colors line-clamp-2">{u}</Link>
                        ) : <span className="font-semibold text-navy line-clamp-2">{u}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (s.studyIn ?? []).length > 0 ? (
                  <p>
                    Any eligible university in{' '}
                    {s.studyIn!.map((c, i) => (
                      <span key={c}>
                        {i > 0 && ', '}
                        <Link href={`/universities?country=${encodeURIComponent(c)}`}
                          className="font-semibold text-gold hover:text-navy transition-colors">{c}</Link>
                      </span>
                    ))}
                  </p>
                ) : (
                  <p>Not tied to one destination; check the official site for eligible institutions.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-bold text-navy text-[14px] mb-3">Benefits</h3>
                  <ul className="flex flex-col gap-2">
                    {s.benefits.map(b => (
                      <li key={b} className="flex items-start gap-2 text-[13px] text-navy/65">
                        <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5 9-10" />
                          </svg>
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-navy text-[14px] mb-3">Requirements</h3>
                  <ul className="flex flex-col gap-2 text-[13px] text-navy/65">
                    <li>Min GPA: <strong>{show(s.requirements.minGPA) ?? 'Not specified'}</strong></li>
                    <li>Min %: <strong>{show(s.requirements.minPercentage) ? `${s.requirements.minPercentage}%` : 'Not specified'}</strong></li>
                    {show(s.requirements.minIELTS) && <li>Min IELTS: <strong>{s.requirements.minIELTS}</strong></li>}
                    {show(s.requirements.minTOEFL) && <li>Min TOEFL: <strong>{s.requirements.minTOEFL}</strong></li>}
                    {show(s.requirements.ageLimit) && <li>Age limit: <strong>{s.requirements.ageLimit}</strong></li>}
                    <li>Exams: <strong>{s.requirements.exams.length ? s.requirements.exams.join(', ') : 'None listed'}</strong></li>
                    <li>Eligible: <strong>{s.requirements.nationality.join(', ')}</strong></li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-1 flex-wrap mb-6">
                {[...s.levels, ...s.fields].map((l, i) => (
                  <span key={`${i}-${l}`}className="text-[11px] bg-navy/5 text-navy/60 px-2.5 py-1 rounded-full border border-navy/10">{l}</span>
                ))}
              </div>

              <a href={s.link} target="_blank" rel="noopener noreferrer"
                className="block w-full py-3.5 bg-navy text-white font-bold text-[14px] rounded-xl text-center transition-all hover:bg-navy-mid hover:-translate-y-0.5">
                Apply on Official Site →
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
