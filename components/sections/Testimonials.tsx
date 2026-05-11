'use client'

import Image from 'next/image'
import { testimonials } from '@/lib/data'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-20 md:py-24 px-5 md:px-10 lg:px-16">
      <AnimatedSection className="text-center mb-14">
        <div className="section-tag">Alumni Voices</div>
        <h2 className="section-heading">Lives Transformed</h2>
        <p className="text-[17px] leading-relaxed text-navy/60 max-w-xl mx-auto">
          Real stories from real scholars who changed their trajectories with GlobalReach.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <AnimatedSection key={t.name} delay={i * 0.12} direction="up">
            <div className="bg-cream rounded-2xl border border-gold/12 p-8 transition-all duration-400
              hover:shadow-xl hover:-translate-y-1.5 h-full flex flex-col">
              <div className="font-display text-[40px] text-gold leading-none mb-4">&quot;</div>
              <p className="text-[15px] text-navy/65 leading-[1.75] flex-1 mb-6">{t.quote}</p>
              <div className="flex items-center gap-3">
                <Image
                  src={t.avatarUrl}
                  alt={t.name}
                  width={44} height={44}
                  className="w-11 h-11 rounded-full object-cover border-2 border-gold/30"
                />
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-navy">{t.name}</div>
                  <div className="text-[12px] text-navy/45">{t.role}</div>
                </div>
                <span className="text-xl">{t.flag}</span>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
