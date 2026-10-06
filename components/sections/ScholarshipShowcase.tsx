'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import scholarshipsData from '@/lib/scholarships.json'
import type { Scholarship } from '@/types'

const baseScholarships = scholarshipsData as Scholarship[]

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
  if (days < 30) return <span className="text-[11px] text-orange-500 font-bold">{days}d left</span>
  return <span className="text-[11px] text-navy/50">{new Date(deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
}

export default function ScholarshipShowcase() {
  const [addedScholarships, setAddedScholarships] = useState<Scholarship[]>([])
  const [selected, setSelected] = useState<Scholarship | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gr_custom_scholarships')
      if (stored) setAddedScholarships(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  const allScholarships = useMemo(
    () => [...addedScholarships, ...baseScholarships],
    [addedScholarships]
  )

  // Show 6 most recent scholarships
  const featured = useMemo(
    () => allScholarships.slice(0, 6),
    [allScholarships]
  )

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-cream to-white">
      <div className="px-5 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="text-gold text-[11px] font-bold uppercase tracking-[2px] mb-2">Popular Scholarships</div>
            <h2 className="font-display font-bold text-navy mb-2"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              Featured <em className="text-gold">Opportunities</em>
            </h2>
            <p className="text-navy/55 text-[15px] md:text-[16px] max-w-2xl">
              Explore a curated selection of top scholarships from around the world. Visit our full database to discover all available opportunities.
            </p>
          </div>
          <Link href="/scholarships"
            className="px-6 py-3 rounded-2xl bg-gold text-navy font-semibold hover:bg-gold/90 transition-all whitespace-nowrap">
            View All Scholarships →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              onClick={() => setSelected(s)}
              className="bg-white rounded-2xl border border-gold/12 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group">
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={s.imageUrl}
                  alt={s.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                  {s.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        STATUS_COLORS[tag] || 'bg-white/20 text-white'
                      }`}>
                      {tag}
                    </span>
                  ))}
                </div>
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
                    <span key={l} className="text-[10px] bg-cream text-navy/60 px-2 py-0.5 rounded-full border border-gold/15">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 text-center">
          <p className="text-navy/60 text-[15px] mb-4">
            Want to explore more opportunities? Our database contains {allScholarships.length} scholarships from around the world.
          </p>
          <Link href="/scholarships"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-navy text-white font-semibold hover:bg-navy/90 transition-all">
            Browse Full Database
            <span className="text-lg">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
