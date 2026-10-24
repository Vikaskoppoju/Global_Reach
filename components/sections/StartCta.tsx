import Image from 'next/image'
import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { ART } from '@/lib/illustrations'

// Closing call to action for visitors who reach the bottom without picking a path
export default function StartCta() {
  return (
    <section className="bg-cream py-16 md:py-20 px-5 md:px-10 lg:px-16">
      <AnimatedSection className="max-w-[1000px] mx-auto rounded-[28px] bg-gold-pale border border-gold/30 overflow-hidden
        flex flex-col md:flex-row">
        <div className="md:w-[34%] shrink-0 bg-white/70 p-8 flex items-center justify-center">
          <div className="relative w-full h-44 md:h-52">
            <Image src={ART.phoneCall} alt="" fill className="object-contain" />
          </div>
        </div>
        <div className="flex-1 p-8 md:p-10">
          <h2 className="font-display font-bold text-navy leading-tight mb-3"
            style={{ fontSize: 'clamp(26px, 3.4vw, 38px)', letterSpacing: '-0.5px' }}>
            Not sure where to start?
          </h2>
          <p className="text-[16px] leading-relaxed text-navy/65 max-w-lg">
            Tell us your marks and the countries you like. A counsellor will call you back for free and
            suggest scholarships that fit you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <Link href="/services#enquire" className="btn-primary text-center">
              Request a free call
            </Link>
            <Link href="/scholarships"
              className="inline-flex items-center justify-center rounded-full border border-navy/20 px-7 py-3 text-[15px] font-semibold text-navy
                hover:border-navy transition-colors">
              Browse on my own
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </section>
  )
}
