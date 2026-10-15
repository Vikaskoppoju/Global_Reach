'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Flag } from '@/components/ui/ScholarshipCard'
import { atlasStats, scholarshipStats } from '@/lib/data'

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] },
})

// Plain-language entry points into the scholarship list by study level
const LEVEL_LINKS = [
  { level: "Bachelor's", label: 'University (Bachelor’s)', hint: 'Finishing school' },
  { level: "Master's", label: 'Master’s degree', hint: 'Already have a degree' },
  { level: 'PhD', label: 'PhD & research', hint: 'Have a Master’s' },
]

export default function Hero() {
  const router = useRouter()
  const [q, setQ] = useState('')

  const search = (e: FormEvent) => {
    e.preventDefault()
    const query = q.trim()
    router.push(query ? `/universities?q=${encodeURIComponent(query)}` : '/universities')
  }

  return (
    <section
      id="home"
      className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center
        px-5 md:px-10 lg:px-16 pt-32 pb-16 lg:pt-36 lg:pb-24 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full top-[-100px] right-[-100px] animate-float pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)' }} />

      {/* Left column */}
      <div className="relative z-10">
        <motion.div {...fadeUp(0.1)}
          className="inline-flex items-center gap-2 bg-gold-pale border border-gold/30
            rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[1.5px] text-[#8A6A1A] mb-7"
        >
          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
          For students who dream of studying abroad
        </motion.div>

        <motion.h1 {...fadeUp(0.2)}
          className="font-display font-bold text-navy leading-[1.08] mb-6"
          style={{ fontSize: 'clamp(36px, 4.6vw, 58px)', letterSpacing: '-1.5px' }}
        >
          Find your university abroad, <em className="text-gold">and the scholarship to fund&nbsp;it</em>
        </motion.h1>

        <motion.p {...fadeUp(0.3)} className="text-[17px] leading-[1.7] text-navy/60 max-w-[520px] mb-9">
          Pick a country, find a university, and see the scholarships that can help pay for it.
          Explore {atlasStats.universities} universities and {scholarshipStats.total} scholarships, free.
        </motion.p>

        <motion.form {...fadeUp(0.4)} onSubmit={search} role="search"
          className="flex flex-col sm:flex-row gap-3 max-w-[560px]">
          <label htmlFor="hero-search" className="sr-only">Search universities or countries</label>
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/35" fill="none" stroke="currentColor"
              strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-4-4" />
            </svg>
            <input id="hero-search" type="search" value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search a university or country"
              className="w-full bg-white border border-gold/25 rounded-full pl-12 pr-5 py-4 text-[15px] text-navy
                placeholder:text-navy/35 outline-none shadow-sm focus:border-gold focus:ring-4 focus:ring-gold/10" />
          </div>
          <button type="submit" className="btn-primary shadow-[0_8px_24px_rgba(15,31,61,0.25)]">
            Search
          </button>
        </motion.form>

        <motion.div {...fadeUp(0.5)} className="mt-6">
          <p className="text-[13px] font-semibold text-navy/55 mb-2.5">Show me scholarships for…</p>
          <div className="flex flex-wrap gap-2.5">
            {LEVEL_LINKS.map(l => (
              <a key={l.level} href={`/scholarships?level=${encodeURIComponent(l.level)}`}
                className="group rounded-2xl border border-gold/30 bg-white px-4 py-2.5 hover:border-gold hover:bg-gold-pale transition-colors">
                <span className="block text-[14px] font-semibold text-navy">{l.label}</span>
                <span className="block text-[12px] text-navy/50">{l.hint}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.dl {...fadeUp(0.6)} className="flex gap-10 mt-12">
          {[
            { num: atlasStats.universities, label: 'Universities' },
            { num: scholarshipStats.total, label: 'Scholarships' },
            { num: atlasStats.countries, label: 'Countries' },
          ].map(s => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display font-bold text-navy leading-none mb-1.5" style={{ fontSize: 'clamp(26px, 3vw, 36px)' }}>
                {s.num.replace('+', '')}{s.num.endsWith('+') && <span className="text-gold">+</span>}
              </dd>
              <dd className="text-[13px] text-navy/50 font-medium tracking-wide">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Right column — popular destinations from the scholarship data */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10"
      >
        <div className="bg-white rounded-[28px] border border-gold/20 shadow-[0_24px_60px_rgba(15,31,61,0.10)] p-6 md:p-7">
          <div className="text-[11px] font-bold uppercase tracking-[2px] text-gold mb-1">Popular destinations</div>
          <h2 className="font-display font-bold text-navy text-[22px] mb-5">Countries with the most scholarships</h2>
          <ul className="divide-y divide-gold/10">
            {scholarshipStats.topDestinations.map(d => (
              <li key={d.country}>
                <a href={`/scholarships?country=${encodeURIComponent(d.country)}`}
                  className="group flex items-center gap-4 py-3.5 -mx-2 px-2 rounded-xl hover:bg-cream transition-colors">
                  <Flag country={d.country} className="w-10 h-7" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold text-navy">{d.country}</span>
                    <span className="block text-[12px] text-navy/50">
                      {d.scholarships} scholarships · {d.universities} universities
                    </span>
                  </span>
                  <svg className="w-4 h-4 text-navy/30 transition-all group-hover:text-gold group-hover:translate-x-1" fill="none"
                    stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
          <a href="/scholarships" className="mt-4 block text-center text-[13px] font-semibold text-gold hover:text-navy transition-colors">
            See every destination →
          </a>
        </div>
      </motion.div>
    </section>
  )
}
