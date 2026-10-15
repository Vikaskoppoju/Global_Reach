import AnimatedSection from '@/components/ui/AnimatedSection'

const STEPS = [
  {
    title: 'Pick a country',
    text: 'Look through the world regions and choose where you would love to study.',
    href: '#countries',
    cta: 'See destinations',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" /></>,
  },
  {
    title: 'Find a university',
    text: 'Browse universities that welcome students from other countries and visit their websites.',
    href: '/universities',
    cta: 'Browse universities',
    icon: <><path strokeLinejoin="round" d="M12 4 2 9l10 5 10-5-10-5Z" /><path strokeLinejoin="round" d="M6 11v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" /></>,
  },
  {
    title: 'Check the scholarships',
    text: 'Every university shows the scholarships that can help pay for your studies, with their deadlines.',
    href: '/scholarships',
    cta: 'Find scholarships',
    icon: <><rect x="4" y="3" width="16" height="18" rx="2" /><path strokeLinecap="round" d="M8 8h8M8 12h8M8 16h5" /></>,
  },
]

const WORDS = [
  { word: 'Fully funded', meaning: 'Pays your tuition and usually your living costs too.' },
  { word: 'Partially funded', meaning: 'Pays part of the cost, for example some of the tuition.' },
  { word: 'Need-based', meaning: 'Given to students whose families need help paying.' },
  { word: 'Deadline', meaning: 'The last day you can apply. It is best to apply early!' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 md:py-24 px-5 md:px-10 lg:px-16 scroll-mt-20">
      <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
        <div className="section-tag">How it works</div>
        <h2 className="font-display font-bold text-navy leading-tight"
          style={{ fontSize: 'clamp(30px, 4vw, 46px)', letterSpacing: '-1px' }}>
          Your scholarship search in <em className="text-gold whitespace-nowrap">3 easy steps</em>
        </h2>
      </AnimatedSection>

      <div className="grid gap-6 md:grid-cols-3 max-w-[1200px] mx-auto">
        {STEPS.map((step, i) => (
          <AnimatedSection key={step.title} delay={i * 0.1} className="h-full">
            <div className="h-full rounded-3xl border border-gold/20 bg-cream p-7 flex flex-col">
              <div className="flex items-center gap-4 mb-5">
                <span className="w-12 h-12 rounded-2xl bg-navy text-gold-light flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
                    {step.icon}
                  </svg>
                </span>
                <span className="font-display text-[40px] font-bold leading-none text-gold/40" aria-label={`Step ${i + 1}`}>{i + 1}</span>
              </div>
              <h3 className="font-display font-bold text-navy text-[21px] mb-2">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-navy/60 mb-5">{step.text}</p>
              <a href={step.href} className="mt-auto inline-flex items-center gap-2 text-[14px] font-semibold text-navy hover:text-gold transition-colors">
                {step.cta} <span aria-hidden>→</span>
              </a>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <AnimatedSection className="max-w-[1200px] mx-auto mt-10">
        <div className="rounded-3xl bg-gold-pale border border-gold/25 p-7 md:p-8">
          <h3 className="font-display font-bold text-navy text-[20px] mb-5">Scholarship words, made simple</h3>
          <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WORDS.map(w => (
              <div key={w.word}>
                <dt className="text-[14px] font-bold text-navy mb-1">{w.word}</dt>
                <dd className="text-[14px] leading-relaxed text-navy/65">{w.meaning}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 pt-5 border-t border-gold/25 text-[14px] text-navy/70">
            <strong className="text-navy">Tip:</strong> always check the details on the official scholarship website, and
            ask a parent, teacher or school counsellor to help you with your application.
          </p>
        </div>
      </AnimatedSection>
    </section>
  )
}
