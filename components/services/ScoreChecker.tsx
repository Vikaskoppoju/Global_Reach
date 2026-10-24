'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { baseScholarships } from '@/lib/scholarships'

type Test = 'IELTS' | 'TOEFL' | 'none'

const IELTS_BANDS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]

// Minimum scores set by the scholarships that state one
const MINIMUMS: Record<'IELTS' | 'TOEFL', number[]> = {
  IELTS: baseScholarships.map(s => s.requirements.minIELTS).filter((v): v is number => !!v),
  TOEFL: baseScholarships.map(s => s.requirements.minTOEFL).filter((v): v is number => !!v),
}

const tabCls = (active: boolean) =>
  `flex-1 rounded-full px-3 py-2 text-[13px] font-semibold transition-colors ${active ? 'bg-navy text-white' : 'text-navy/60 hover:text-navy'}`

export default function ScoreChecker() {
  const [test, setTest] = useState<Test>('IELTS')
  const [ielts, setIelts] = useState(6)
  const [toefl, setToefl] = useState(80)

  const result = useMemo(() => {
    if (test === 'none') return null
    const mins = MINIMUMS[test]
    const score = test === 'IELTS' ? ielts : toefl
    const meets = mins.filter(m => m <= score).length
    const nextMin = Math.min(...mins.filter(m => m > score))
    const unlock = Number.isFinite(nextMin) ? mins.filter(m => m > score && m <= nextMin).length : 0
    return { total: mins.length, meets, nextMin: Number.isFinite(nextMin) ? nextMin : null, unlock }
  }, [test, ielts, toefl])

  const prepSlug = test === 'TOEFL' ? 'toefl' : 'ielts'
  const pct = result ? Math.round((result.meets / result.total) * 100) : 0

  return (
    <div className="bg-white rounded-[28px] border border-gold/20 shadow-[0_24px_60px_rgba(15,31,61,0.10)] p-6 md:p-7">
      <div className="text-[11px] font-bold uppercase tracking-[2px] text-gold mb-1">Quick check</div>
      <h2 className="font-display font-bold text-navy text-[22px] leading-snug mb-4">Is your English score enough?</h2>

      <div className="flex gap-1 rounded-full bg-cream p-1 mb-5" role="group" aria-label="Your test">
        <button type="button" className={tabCls(test === 'IELTS')} aria-pressed={test === 'IELTS'} onClick={() => setTest('IELTS')}>IELTS</button>
        <button type="button" className={tabCls(test === 'TOEFL')} aria-pressed={test === 'TOEFL'} onClick={() => setTest('TOEFL')}>TOEFL</button>
        <button type="button" className={tabCls(test === 'none')} aria-pressed={test === 'none'} onClick={() => setTest('none')}>Not taken yet</button>
      </div>

      {test === 'IELTS' && (
        <div className="mb-5">
          <p id="score-ielts-label" className="text-[13px] font-semibold text-navy/60 mb-2">My IELTS band (overall)</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="score-ielts-label">
            {IELTS_BANDS.map(b => (
              <button key={b} type="button" onClick={() => setIelts(b)} aria-pressed={ielts === b}
                className={`w-12 rounded-xl border py-2 text-[14px] font-bold transition-colors
                  ${ielts === b ? 'bg-gold border-gold text-navy' : 'border-gold/25 text-navy/70 hover:border-gold'}`}>
                {b.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {test === 'TOEFL' && (
        <div className="mb-5">
          <div className="flex items-baseline justify-between mb-2">
            <label htmlFor="score-toefl" className="text-[13px] font-semibold text-navy/60">My TOEFL iBT score</label>
            <span className="font-display text-[26px] font-bold text-navy tabular-nums">{toefl}</span>
          </div>
          <input id="score-toefl" type="range" min={40} max={120} step={1} value={toefl}
            onChange={e => setToefl(Number(e.target.value))} className="w-full accent-[#C9A84C]" />
          <div className="flex justify-between text-[11px] text-navy/40 mt-1"><span>40</span><span>120</span></div>
        </div>
      )}

      {result ? (
        <div className="rounded-2xl bg-cream p-4 mb-5" aria-live="polite">
          <p className="text-[15px] text-navy leading-relaxed">
            You meet the minimum for <strong className="text-[20px] font-display">{result.meets}</strong> of the{' '}
            {result.total} scholarships that set a {test} minimum.
          </p>
          <div className="mt-3 h-2.5 rounded-full bg-white overflow-hidden" aria-hidden>
            <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          {result.nextMin !== null ? (
            <p className="mt-3 text-[14px] text-navy/70">
              Reach <strong className="text-navy">{test === 'IELTS' ? result.nextMin.toFixed(1) : result.nextMin}</strong> and{' '}
              <strong className="text-green-700">{result.unlock} more</strong> open up for you.
            </p>
          ) : (
            <p className="mt-3 text-[14px] text-green-700 font-semibold">Great score: you meet every minimum in our database.</p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-cream p-4 mb-5 text-[15px] text-navy leading-relaxed" aria-live="polite">
          No problem. Most students start here. Take a <strong>free diagnostic test</strong> to find out your band,
          then we’ll show you how far you are from your scholarships.
        </div>
      )}

      <Link href={`/services/${prepSlug}?package=${encodeURIComponent('Diagnostic test')}#enquire`}
        className="block w-full py-3.5 bg-navy text-white font-bold text-[14px] rounded-xl text-center transition-all hover:bg-navy-mid hover:-translate-y-0.5">
        Get a free diagnostic test
      </Link>
      <p className="mt-2 text-center text-[12px] text-navy/40">Free of charge. Takes about 90 minutes.</p>
    </div>
  )
}
