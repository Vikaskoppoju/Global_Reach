'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ScholarshipTile } from '@/components/ui/ScholarshipCard'
import ScholarshipModal from '@/components/ui/ScholarshipModal'
import { compareDeadlines, deadlineInfo, useScholarships } from '@/lib/scholarships'
import { useUniversityLogos } from '@/lib/atlas'
import type { Scholarship } from '@/types'

export default function ScholarshipShowcase() {
  const allScholarships = useScholarships()
  const logos = useUniversityLogos()
  const [selected, setSelected] = useState<Scholarship | null>(null)

  // Six open scholarships tied to a study country, soonest deadline first
  const featured = allScholarships
    .filter(s => {
      const d = deadlineInfo(s.deadline)
      return (s.studyIn ?? []).length > 0 && (d.kind === 'text' || d.daysLeft >= 0)
    })
    .sort((a, b) => compareDeadlines(a.deadline, b.deadline))
    .slice(0, 6)

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-cream to-white">
      <div className="px-5 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="text-gold text-[11px] font-bold uppercase tracking-[2px] mb-2">Scholarships</div>
            <h2 className="font-display font-bold text-navy"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              Closing <em className="text-gold">soon</em>
            </h2>
            <p className="text-[16px] leading-relaxed text-navy/60 mt-3 max-w-xl">
              These deadlines are coming up first. Tap a card to see who can apply, what it pays and how to apply.
            </p>
          </div>
          <Link href="/scholarships"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-navy text-white text-[14px] font-semibold
              hover:bg-navy-mid transition-all whitespace-nowrap self-start md:self-auto">
            All {allScholarships.length} scholarships →
          </Link>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}>
              <ScholarshipTile s={s} logos={logos} onSelect={() => setSelected(s)} />
            </motion.li>
          ))}
        </ul>
      </div>

      <ScholarshipModal s={selected} logos={logos} onClose={() => setSelected(null)} />
    </section>
  )
}
