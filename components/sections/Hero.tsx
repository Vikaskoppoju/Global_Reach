'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { atlasStats } from '@/lib/data'

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] },
})

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center
        px-5 md:px-10 lg:px-16 pt-28 pb-16 lg:pt-32 lg:pb-20 relative overflow-hidden"
    >
      {/* Background circles */}
      <div className="absolute w-[600px] h-[600px] rounded-full top-[-100px] right-[-100px] animate-float pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full bottom-[-50px] left-[200px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite', animationDelay: '-4s' }} />

      {/* Left column */}
      <div className="relative z-10">
        <motion.div {...fadeUp(0.2)}
          className="inline-flex items-center gap-2 bg-gold-pale border border-gold/30
            rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[1.5px]
            text-[#8A6A1A] mb-7"
        >
          <span className="w-1.5 h-1.5 bg-gold rounded-full" />
          World University Atlas
        </motion.div>

        <motion.h1 {...fadeUp(0.35)}
          className="font-display font-bold text-navy leading-[1.08] mb-6"
          style={{ fontSize: 'clamp(40px, 6vw, 68px)', letterSpacing: '-2px' }}
        >
          Build Your Career<br />
          at <em className="text-gold not-italic">Universities</em><br />
          Across the Globe
        </motion.h1>

        <motion.p {...fadeUp(0.5)}
          className="text-[17px] leading-[1.7] text-navy/60 max-w-[460px] mb-11"
        >
          Explore {atlasStats.universities} universities that welcome international students across{' '}
          {atlasStats.countries} countries. Start with a region, compare countries, and find the
          scholarships that get you there.
        </motion.p>

        <motion.div {...fadeUp(0.65)} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <a href="#countries" className="btn-primary shadow-[0_8px_24px_rgba(15,31,61,0.25)] text-center sm:text-left">
            Explore Universities
          </a>
          <a href="/scholarships" className="inline-flex items-center gap-2 text-navy/60 font-medium hover:text-navy transition-colors group">
            Find scholarships
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          {/* Process section is hidden — restore with it
          <a href="#process" className="inline-flex items-center gap-2 text-navy/60 font-medium hover:text-navy transition-colors group">
            See how it works
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          */}
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.8)}
          className="flex gap-0 mt-14 border border-gold/20 rounded-2xl overflow-hidden
            sm:border-0 sm:gap-10 sm:rounded-none sm:overflow-visible"
        >
          {[
            { num: atlasStats.universities, label: 'Universities' },
            { num: atlasStats.countries, label: 'Countries' },
            { num: atlasStats.regions, label: 'World Regions' },
          ].map((s, i) => (
            <div key={s.label}
              className={`flex-1 text-center sm:text-left py-5 sm:py-0
                ${i < 2 ? 'border-r border-gold/20 sm:border-0' : ''}`}
            >
              <div className="font-display font-bold text-navy leading-none mb-1.5"
                style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}>
                {s.num.replace(/\d+/, m => `${m}`).split('').map((c, ci) =>
                  /[^0-9]/.test(c)
                    ? <span key={ci} className="text-gold">{c}</span>
                    : <span key={ci}>{c}</span>
                )}
              </div>
              <div className="text-[13px] text-navy/50 font-medium tracking-wide">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right column — hero image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden lg:flex items-center justify-center relative z-10"
      >
        <div className="relative w-full max-w-[500px]">
          {/* Decorative border */}
          <div className="absolute inset-[-12px] rounded-[36px] border-2 border-gold/25 z-[-1]" />

          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80"
            alt="Students studying abroad"
            width={500}
            height={520}
            className="w-full h-[520px] object-cover rounded-[28px]"
            priority
          />

          {/* Badge top */}
          <div className="absolute top-7 left-[-28px] bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 animate-float-badge">
            <span className="w-10 h-10 rounded-full bg-gold-pale text-gold flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4 2 9l10 5 10-5-10-5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 11v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5M22 9v6" />
              </svg>
            </span>
            <div>
              <div className="text-[15px] font-bold text-navy">{atlasStats.universities} Universities</div>
              <div className="text-[12px] text-navy/50">Open to international students</div>
            </div>
          </div>

          {/* Badge bottom */}
          <div className="absolute bottom-10 right-[-28px] bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 animate-float-badge-rev">
            <span className="w-10 h-10 rounded-full bg-gold-pale text-gold flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
              </svg>
            </span>
            <div>
              <div className="text-[15px] font-bold text-navy">{atlasStats.regions} World Regions</div>
              <div className="text-[12px] text-navy/50">{atlasStats.countries} countries mapped</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
