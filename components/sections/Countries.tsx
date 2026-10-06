'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { atlasStats } from '@/lib/data'
import { useAtlas, topUniversities, countUniversities } from '@/lib/atlas'
import AnimatedSection from '@/components/ui/AnimatedSection'
import UniversityLogo from '@/components/ui/UniversityLogo'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80'

export default function Countries() {
  const continents = useAtlas()
  const [continentId, setContinentId] = useState(continents[0]?.id)

  const continent = continents.find(c => c.id === continentId) ?? continents[0]
  if (!continent) return null
  const top = topUniversities(continent)

  return (
    <section id="countries" className="bg-navy py-20 md:py-24 px-5 md:px-10 lg:px-16">
      <AnimatedSection className="text-center mb-14">
        <div className="section-tag text-gold-light">Destinations</div>
        <h2 className="font-display font-bold text-white leading-tight mb-4"
          style={{ fontSize: 'clamp(34px, 4vw, 52px)', letterSpacing: '-1.5px' }}>
          Where Will You Study?
        </h2>
        <p className="text-white/55 text-[17px] leading-relaxed max-w-xl mx-auto">
          Pick a region to see its leading universities, then explore every university in our{' '}
          <Link href="/universities" className="text-gold-light underline underline-offset-4 hover:text-gold">
            directory of {atlasStats.universities}
          </Link>.
        </p>
      </AnimatedSection>

      {/* Continents */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {continents.map((c, i) => {
          const active = c.id === continentId
          return (
            <AnimatedSection key={c.id} delay={i * 0.08} direction="up">
              <button
                type="button"
                onClick={() => setContinentId(c.id)}
                aria-pressed={active}
                className={`relative w-full text-left rounded-2xl overflow-hidden group outline-none
                  ring-2 transition-all duration-300
                  ${active ? 'ring-gold' : 'ring-transparent hover:ring-white/30 focus-visible:ring-white/60'}`}
              >
                <Image
                  src={c.imageUrl || FALLBACK_IMAGE}
                  alt={c.name}
                  width={320}
                  height={220}
                  // Images set in admin may come from hosts next.config doesn't allow; skip optimising those
                  unoptimized={!(c.imageUrl || FALLBACK_IMAGE).startsWith('https://images.unsplash.com/')}
                  className={`w-full h-[150px] sm:h-[190px] xl:h-[220px] object-cover transition-all duration-500
                    group-hover:scale-[1.06] ${active ? 'brightness-[0.55]' : 'brightness-[0.7] group-hover:brightness-50'}`}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 to-transparent">
                  <div className="text-white text-[15px] font-bold leading-tight">{c.name}</div>
                  <div className="text-white/65 text-[12px] mt-0.5">
                    {c.countries.length} {c.countries.length === 1 ? 'country' : 'countries'} · {countUniversities(c)} universities
                  </div>
                </div>
                {active && (
                  <span className="absolute top-3 right-3 bg-gold text-navy text-[11px] font-bold px-2.5 py-1 rounded-full">
                    Selected
                  </span>
                )}
              </button>
            </AnimatedSection>
          )
        })}
      </div>

      {/* Selected continent: top 5 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={continent.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mt-10 rounded-3xl bg-white/[0.04] border border-white/10 p-5 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-7">
            <div>
              <div className="text-gold-light text-[11px] font-bold uppercase tracking-[2px] mb-2">
                Top 5 in {continent.name}
              </div>
              <h3 className="text-white font-bold text-[22px]">{continent.name}</h3>
              <p className="text-white/55 text-[14px] mt-1">{continent.tagline}</p>
            </div>
            <Link
              href={`/universities?region=${continent.id}`}
              className="self-start md:self-auto inline-flex items-center gap-2 bg-gold text-navy text-[13px] font-bold
                px-5 py-2.5 rounded-full transition-all hover:bg-gold-light hover:-translate-y-0.5 whitespace-nowrap"
            >
              Explore all {countUniversities(continent)} universities →
            </Link>
          </div>

          <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {top.map((u, i) => (
              <li key={u.name}
                className="relative flex lg:flex-col items-center lg:items-start gap-4 rounded-2xl bg-white/[0.06]
                  border border-white/5 p-4 lg:p-5">
                <span className="absolute top-3 right-4 font-display text-[22px] font-bold text-white/15">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <UniversityLogo name={u.name} logo={u.logo} size="lg" />
                <div className="min-w-0 pr-8 lg:pr-0">
                  <div className="text-white text-[14px] font-semibold leading-snug">{u.name}</div>
                  <div className="text-white/50 text-[12px] mt-1">{u.country}</div>
                  {u.website && (
                    <a href={u.website} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-2 text-gold-light text-[12px] font-semibold hover:text-gold">
                      Website ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <p className="text-white/40 text-[11px] mt-5">
            Top 5 based on leading international rankings. All listed universities admit international students;
            confirm entry requirements with each university&apos;s admissions office before applying.
          </p>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
