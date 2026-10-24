import Image from 'next/image'
import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { ART } from '@/lib/illustrations'
import { CATEGORIES, categoryComingSoon, formatINR, startingPrice } from '@/lib/services'
import { getCatalogue } from '@/lib/server/catalogue'

const CARD_ART: Record<string, string> = {
  'test-prep': ART.testPrep,
  application: ART.essay,
  interview: ART.interview,
}

export default async function ServicesShowcase() {
  const { services } = await getCatalogue()
  return (
    <section id="services" className="bg-white py-16 md:py-24 px-5 md:px-10 lg:px-16 scroll-mt-20">
      <div className="max-w-[1300px] mx-auto">
        <AnimatedSection className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="text-gold text-[11px] font-bold uppercase tracking-[2px] mb-2">Services</div>
            <h2 className="font-display font-bold text-navy"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              Found a scholarship? <em className="text-gold">We’ll help you get ready</em>
            </h2>
            <p className="text-[16px] leading-relaxed text-navy/60 mt-3 max-w-xl">
              Most scholarships ask for a test score, written essays and an interview. Our counsellors help with each one.
            </p>
          </div>
          <Link href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-navy text-white text-[14px] font-semibold
              hover:bg-navy-mid transition-all whitespace-nowrap self-start md:self-auto">
            All services →
          </Link>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((cat, i) => {
            const items = services.filter(s => s.category === cat.id)
            const from = Math.min(...items.map(startingPrice))
            return (
              <AnimatedSection key={cat.id} delay={i * 0.1} className="h-full">
                <div className="group h-full rounded-3xl border border-gold/20 bg-cream overflow-hidden flex flex-col">
                  <div className="m-3 mb-0 h-40 rounded-2xl bg-white p-5">
                    <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-[1.04]">
                      <Image src={CARD_ART[cat.id]} alt="" fill className="object-contain" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col px-7 pt-6 pb-7">
                    <h3 className="font-display font-bold text-navy text-[21px] mb-2 flex flex-wrap items-center gap-2">
                      {cat.label}
                      {categoryComingSoon(cat.id) && (
                        <span className="font-sans text-[10px] font-bold uppercase tracking-wide bg-gold-pale text-[#8A6A1A] border border-gold/40 rounded-full px-2 py-0.5">
                          Coming soon
                        </span>
                      )}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-navy/60 mb-4">{cat.tagline}</p>
                    <ul className="flex flex-wrap gap-2 mb-6">
                      {items.map(s => (
                        <li key={s.slug}>
                          <Link href={`/services/${s.slug}`}
                            className="inline-block text-[12px] font-semibold text-navy/70 bg-white border border-gold/25 rounded-full px-3 py-1 hover:border-gold hover:text-navy transition-colors">
                            {s.name.replace(' preparation', '')}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-center justify-between gap-3">
                      <span className="text-[13px] text-navy/50">
                        {categoryComingSoon(cat.id) ? 'Launching soon' : <>From <strong className="text-navy">{formatINR(from)}</strong></>}
                      </span>
                      <Link href={`/services#${cat.id}`} className="text-[14px] font-semibold text-navy hover:text-gold transition-colors">
                        {categoryComingSoon(cat.id) ? 'Get notified →' : 'See options →'}
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
