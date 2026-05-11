'use client'

import Image from 'next/image'
import { countries } from '@/lib/data'
import AnimatedSection from '@/components/ui/AnimatedSection'

export default function Countries() {
  return (
    <section id="countries" className="bg-navy py-20 md:py-24 px-5 md:px-10 lg:px-16">
      <AnimatedSection className="text-center mb-14">
        <div className="section-tag text-gold-light">Destinations</div>
        <h2 className="font-display font-bold text-white leading-tight mb-4"
          style={{ fontSize: 'clamp(34px, 4vw, 52px)', letterSpacing: '-1.5px' }}>
          Where Will You Study?
        </h2>
        <p className="text-white/55 text-[17px] leading-relaxed max-w-xl mx-auto">
          From Oxford to Tokyo — our partner universities span every continent, opening doors to world-class education.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {countries.map((country, i) => (
          <AnimatedSection key={country.name} delay={i * 0.08} direction="up">
            <div className="relative rounded-2xl overflow-hidden cursor-pointer group">
              <Image
                src={country.imageUrl}
                alt={country.name}
                width={300}
                height={220}
                className="w-full h-[160px] sm:h-[200px] lg:h-[220px] object-cover
                  brightness-[0.7] transition-all duration-500
                  group-hover:scale-[1.08] group-hover:brightness-50"
              />

              {/* Default info */}
              <div className="absolute bottom-0 left-0 right-0 p-4
                bg-gradient-to-t from-black/80 to-transparent">
                <div className="text-white text-[15px] font-bold">
                  {country.flag} {country.name}
                </div>
                <div className="text-white/65 text-[12px] mt-0.5">{country.universities}</div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity duration-400 p-4">
                <div className="text-white text-[13px] font-semibold">{country.cost}</div>
                <div className="mt-2 bg-gold text-navy text-[12px] font-bold px-4 py-1.5 rounded-full">
                  Explore →
                </div>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  )
}
