'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { policies } from '@/lib/data'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default function Policies() {
  const [active, setActive] = useState(0)
  const current = policies[active]

  return (
    <section id="policies" className="bg-cream py-20 md:py-24 px-5 md:px-10 lg:px-16">
      <AnimatedSection className="mb-14">
        <div className="section-tag">Scholarship Policies</div>
        <h2 className="section-heading">Everything You<br />Need to Know</h2>
        <p className="text-[17px] leading-relaxed text-navy/60 max-w-xl">
          Transparent, fair, and designed for ambitious students from all backgrounds.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-14 items-start">
        {/* Policy list */}
        <div className="flex flex-col gap-3">
          {policies.map((policy, i) => (
            <AnimatedSection key={policy.title} delay={i * 0.07} direction="left">
              <button
                onClick={() => setActive(i)}
                className={`policy-card-base w-full text-left
                  ${active === i ? 'active shadow-xl translate-x-1' : ''}`}
              >
                <div className="text-2xl mb-2">{policy.icon}</div>
                <div className="text-[16px] font-bold text-navy mb-1">{policy.title}</div>
                <div className="text-[14px] text-navy/50 leading-relaxed">{policy.description}</div>
              </button>
            </AnimatedSection>
          ))}
        </div>

        {/* Detail panel */}
        <AnimatedSection direction="right" className="lg:sticky lg:top-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-[28px] border border-gold/15 p-8 md:p-11"
            >
              <div className="text-5xl mb-5">{current.icon}</div>
              <h3 className="font-display font-bold text-navy text-[26px] md:text-[28px] mb-4">
                {current.title}
              </h3>
              <p className="text-[15px] text-navy/60 leading-[1.8] mb-6">{current.details}</p>
              <ul className="flex flex-col gap-3">
                {current.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[14px] text-navy/65 leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/15 text-gold
                      flex items-center justify-center text-[11px] font-bold mt-0.5">
                      ✓
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </AnimatedSection>
      </div>
    </section>
  )
}
