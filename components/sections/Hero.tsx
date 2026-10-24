'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { atlasStats, scholarshipStats } from '@/lib/data'
import { useAtlas, topUniversities } from '@/lib/atlas'
import { ART } from '@/lib/illustrations'
import UniversityLogo from '@/components/ui/UniversityLogo'

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] },
})

interface Path {
  step: string
  title: string
  text: string
  href: string
  cta: string
  quick: { label: string; href: string }[]
  art: string
  primary?: boolean
}

// Three separate ways in, not steps: a scholarship already names its university, and a university lists its scholarships
const PATHS: Path[] = [
  {
    step: 'Need funding?',
    title: 'Find a scholarship',
    text: `${scholarshipStats.total} scholarships, each with its university. Filter by study level, country, subject and your grades.`,
    href: '/scholarships',
    cta: 'Browse scholarships',
    quick: [
      { label: 'Bachelor’s', href: "/scholarships?level=Bachelor's" },
      { label: 'Master’s', href: "/scholarships?level=Master's" },
      { label: 'PhD', href: '/scholarships?level=PhD' },
    ],
    art: ART.scholarship,
    primary: true,
  },
  {
    step: 'Have a place in mind?',
    title: 'Find a university',
    text: `${atlasStats.universities} universities in ${atlasStats.countries} countries. Pick one to see the scholarships it offers.`,
    href: '/universities',
    cta: 'Browse universities',
    quick: scholarshipStats.topDestinations.slice(0, 3).map(d => ({
      label: d.country,
      href: `/universities?country=${encodeURIComponent(d.country)}`,
    })),
    art: ART.destinations,
  },
  {
    step: 'Ready to apply?',
    title: 'Get help applying',
    text: 'Test prep, SOP and essay reviews, and interview practice with a counsellor.',
    href: '/services',
    cta: 'See our services',
    quick: [
      { label: 'IELTS', href: '/services/ielts' },
      { label: 'SOP review', href: '/services/sop' },
      { label: 'Interviews', href: '/services#interview' },
    ],
    art: ART.applicationHelp,
  },
]

export default function Hero() {
  // The two highest-ranked universities with a logo in each region
  const atlas = useAtlas()
  const featured = useMemo(() => atlas.flatMap(c => topUniversities(c).filter(u => u.logo).slice(0, 2)), [atlas])

  return (
    <section id="home" className="relative overflow-hidden px-5 md:px-10 lg:px-16 pt-28 pb-14 lg:pt-32 lg:pb-16">
      {/* Background glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full top-[-150px] left-1/2 -translate-x-1/2 animate-float pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Wide enough for the heading and the intro to sit on one line each on laptop screens */}
        <div className="text-center max-w-[1100px] mx-auto">
          <motion.h1 {...fadeUp(0.2)}
            className="font-display font-bold text-navy leading-[1.1] mb-4"
            style={{ fontSize: 'clamp(32px, 3.6vw, 48px)', letterSpacing: '-1px' }}
          >
            Study abroad, <em className="text-gold">with a scholarship to pay&nbsp;for&nbsp;it</em>
          </motion.h1>

          <motion.p {...fadeUp(0.3)} className="text-[17px] leading-[1.7] text-navy/60 mb-10">
            Scholarships, universities and application help in one place. Where would you like to start?
          </motion.p>
        </div>

        {/* Path chooser */}
        <ul className="grid gap-5 md:grid-cols-3">
          {PATHS.map((p, i) => (
            <motion.li key={p.title} {...fadeUp(0.4 + i * 0.1)}>
              <div className={`group h-full rounded-3xl overflow-hidden flex flex-col border transition-shadow hover:shadow-[0_24px_60px_rgba(15,31,61,0.12)]
                ${p.primary ? 'bg-navy border-navy text-white' : 'bg-white border-gold/25 text-navy'}`}>
                <div className={`m-3 mb-0 h-40 md:h-44 rounded-2xl p-5 ${p.primary ? 'bg-cream' : 'bg-gold-pale'}`}>
                  <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-[1.04]">
                    <Image src={p.art} alt="" fill priority className="object-contain" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col px-7 pt-6 pb-7">
                  <span className={`text-[11px] font-bold uppercase tracking-[1.5px] mb-2 ${p.primary ? 'text-gold-light' : 'text-gold'}`}>
                    {p.step}
                  </span>

                  <h2 className="font-display font-bold text-[24px] mb-2">{p.title}</h2>
                  <p className={`text-[15px] leading-relaxed mb-5 ${p.primary ? 'text-white/65' : 'text-navy/60'}`}>{p.text}</p>

                  <div className="flex flex-wrap gap-2 mb-7">
                    {p.quick.map(q => (
                      <a key={q.label} href={q.href}
                        className={`text-[12px] font-semibold rounded-full px-3 py-1.5 border transition-colors
                          ${p.primary
                            ? 'border-white/20 text-white/80 hover:border-gold hover:text-gold-light'
                            : 'border-gold/30 bg-cream text-navy/70 hover:border-gold hover:text-navy'}`}>
                        {q.label}
                      </a>
                    ))}
                  </div>

                  <a href={p.href}
                    className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-colors
                      ${p.primary ? 'bg-gold text-navy hover:bg-gold-light' : 'bg-navy text-white hover:bg-navy-mid'}`}>
                    {p.cta} <span aria-hidden>→</span>
                  </a>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>

        {/* Stats */}
        <motion.dl {...fadeUp(0.8)} className="flex flex-wrap justify-center gap-x-12 gap-y-4 mt-12">
          {[
            { num: scholarshipStats.total, label: 'Scholarships' },
            { num: atlasStats.universities, label: 'Universities' },
            { num: atlasStats.countries, label: 'Countries' },
          ].map(s => (
            <div key={s.label} className="flex items-baseline gap-2">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display font-bold text-navy text-[28px] leading-none">
                {s.num.replace('+', '')}{s.num.endsWith('+') && <span className="text-gold">+</span>}
              </dd>
              <dd className="text-[14px] text-navy/50 font-medium">{s.label}</dd>
            </div>
          ))}
        </motion.dl>

        {/* Leading universities, scrolling. The list is drawn twice so the loop has no gap. */}
        {featured.length > 0 && (
          <motion.div {...fadeUp(0.9)} className="mt-14">
            <p className="text-center text-[11px] font-bold uppercase tracking-[2px] text-navy/40 mb-5">
              Some of the top universities you can explore
            </p>
            <div className="overflow-hidden motion-reduce:overflow-x-auto
              [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
              <ul className="flex w-max gap-4 pr-4 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
                {[...featured, ...featured].map((u, i) => (
                  <li key={i} aria-hidden={i >= featured.length || undefined}
                    className="flex items-center gap-3 bg-white border border-gold/20 rounded-full pl-1.5 pr-5 py-1.5">
                    <UniversityLogo name={u.name} logo={u.logo} tone="light" />
                    <span className="text-[13px] font-semibold text-navy whitespace-nowrap">{u.name}</span>
                    <span className="text-[12px] text-navy/45 whitespace-nowrap">{u.country}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
