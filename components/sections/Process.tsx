'use client'

import { steps } from '@/lib/data'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default function Process() {
  return (
    <section id="process" className="bg-navy py-20 md:py-24 px-5 md:px-10 lg:px-16 relative overflow-hidden">
      {/* Decorative circle */}
      <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-14 relative z-10">
        <AnimatedSection>
          <div className="section-tag text-gold-light">Application Process</div>
          <h2 className="font-display font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(34px, 4vw, 52px)', letterSpacing: '-1.5px' }}>
            6 Steps to Your<br />Global Future
          </h2>
        </AnimatedSection>
        <AnimatedSection direction="right">
          <a href="#application" className="btn-primary w-full md:w-auto text-center">
            Start Application
          </a>
        </AnimatedSection>
      </div>

      {/* Steps grid */}
      <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-0 z-10">
        {/* Connector line (desktop only) */}
        <div className="hidden lg:block absolute top-[44px] z-0"
          style={{ left: 'calc(100%/12)', right: 'calc(100%/12)', height: '1px', background: 'rgba(201,168,76,0.25)' }} />

        {steps.map((step, i) => (
          <AnimatedSection key={step.number} delay={i * 0.1} direction="up" className="relative z-10">
            <div className="text-center px-2 group cursor-pointer">
              <div className="flex items-center justify-center mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center
                  bg-gold/12 border border-gold/40 font-display text-[20px] font-bold text-gold
                  transition-all duration-300 group-hover:bg-gold group-hover:text-navy
                  group-hover:border-gold group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(201,168,76,0.4)]">
                  {step.number}
                </div>
              </div>
              <span className="text-[22px] mb-3 block">{step.icon}</span>
              <div className="text-[14px] font-bold text-white mb-2">{step.title}</div>
              <div className="text-[12px] text-white/50 leading-relaxed">{step.description}</div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
