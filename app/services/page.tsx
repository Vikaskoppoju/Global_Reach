import type { Metadata } from 'next'
import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import ServiceCard from '@/components/services/ServiceCard'
import ServiceIcon from '@/components/services/icons'
import ScoreChecker from '@/components/services/ScoreChecker'
import EnquiryForm from '@/components/services/EnquiryForm'
import BundleCard from '@/components/services/BundleCard'
import ServiceChooser from '@/components/services/ServiceChooser'
import { CATEGORIES, bundleBreakdown, categoryComingSoon } from '@/lib/services'
import { getCatalogue } from '@/lib/server/catalogue'
import scholarships from '@/lib/scholarships.json'

export const metadata: Metadata = {
  title: 'Services — IELTS, TOEFL, GRE prep, SOP review & interview practice — GlobalReach',
  description: 'Test preparation for IELTS, TOEFL, PTE, GRE and GMAT, SOP and essay coaching, and admission and scholarship interview practice for students applying abroad.',
}

// How many scholarships list an exam, shown as a reason to prepare
const listing = (exam: string) =>
  scholarships.filter(s => s.requirements.exams.some(e => e.toUpperCase().startsWith(exam))).length

const TRUST = ['Free consultation', 'No upfront payment', 'Mentors who studied abroad']

// There's no checkout on the site: every service starts with a call back
const STEPS = [
  { title: 'Choose a service', text: 'Or select “Not sure yet” and we’ll recommend one.' },
  { title: 'Share your details', text: 'Your name, phone number and the best time to call.' },
  { title: 'Free consultation', text: 'A counsellor calls you, understands your goals and recommends the right option and fees.' },
  { title: 'Confirm your enrolment', text: 'Once you’re happy with the plan, we send a secure payment link to reserve your place.' },
]

const FAQ = [
  { q: 'Is the diagnostic test really free?', a: 'Yes. You take one timed test online and we send you a score estimate by section. You don’t need to buy anything afterwards.' },
  { q: 'Can I buy a service online?', a: 'Not directly. Fill in the call-back form: a counsellor calls you, confirms the right option and price, and then sends a secure payment link to confirm your enrolment. You’re not charged for submitting the form.' },
  { q: 'When will you call me?', a: 'At the time you choose on the form. If we can’t reach you, we’ll message you on WhatsApp to find a better time.' },
  { q: 'Will you write my SOP for me?', a: 'No. Universities treat an SOP written by someone else as cheating, and some check for it. Your mentor helps you plan, gives feedback on every draft and shows you how to make it stronger, but the words are yours.' },
  { q: 'Are classes online?', a: 'Yes, everything is online, so you can join from anywhere. Live batches meet on video calls at fixed times; self-paced courses work on your phone or laptop.' },
  { q: 'Can you guarantee my score or my visa?', a: 'No one honestly can. We help you prepare as well as possible and show you exactly where to improve, but the result depends on the test or the embassy.' },
]

const PHONE_ICON = (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
    <path strokeLinejoin="round" d="M5 4h3.5l1.8 4.4-2.2 1.4a11 11 0 0 0 6.1 6.1l1.4-2.2L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
  </svg>
)

// Same side gutter and width everywhere, so every section lines up
const wrap = 'box-content max-w-[1200px] mx-auto px-5 md:px-10 lg:px-16'
const eyebrow = 'text-gold text-[11px] font-bold uppercase tracking-[2.5px]'
const h2 = 'font-display font-bold text-navy text-balance'
const h2Style = { fontSize: 'clamp(28px, 3.6vw, 40px)', letterSpacing: '-0.5px', lineHeight: 1.15 }

export default async function ServicesPage() {
  const { services, bundles } = await getCatalogue()
  // Highlight the open bundle that saves the most, worked out from the catalogue prices
  const biggestSaving = bundles.filter(b => !b.comingSoon)
    .sort((a, b) => bundleBreakdown(b, services).saving - bundleBreakdown(a, services).saving)[0]?.slug
  const ielts = listing('IELTS')
  const toefl = listing('TOEFL')

  return (
    <>
      <Navbar />
      <main className="bg-cream">
        {/* ── Intro ── */}
        <section className="relative overflow-hidden pt-28 pb-10 md:pt-32 md:pb-12">
          <div className="absolute w-[700px] h-[700px] rounded-full -top-40 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 65%)' }} />
          <div className={`${wrap} relative text-center`}>
            <h1 className="font-display font-bold text-navy mx-auto max-w-[1100px] text-balance"
              style={{ fontSize: 'clamp(32px, 3.6vw, 48px)', letterSpacing: '-1px', lineHeight: 1.1 }}>
              Found your scholarship? <em className="text-gold">Let’s help you win it.</em>
            </h1>
            <p className="mt-4 mx-auto max-w-[900px] text-[17px] leading-[1.7] text-navy/60">
              Test prep, SOP and essay reviews and interview practice. Tell us what you need and we’ll call you back.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a href="#enquire"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-navy text-white text-[15px] font-semibold
                  shadow-[0_10px_30px_rgba(15,31,61,0.25)] hover:bg-navy-mid hover:-translate-y-0.5 transition-all">
                {PHONE_ICON}
                Request a call back
              </a>
              <a href="#score-check"
                className="inline-flex items-center px-7 py-3.5 rounded-full border border-navy/15 bg-white text-navy text-[15px] font-semibold
                  hover:border-navy/40 transition-all">
                Check your English score
              </a>
            </div>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[14px] text-navy/55">
              {TRUST.map(t => (
                <li key={t} className="inline-flex items-center gap-2">
                  <ServiceIcon name="check" className="w-4 h-4 text-gold" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Jump links, stay under the header while scrolling ── */}
        <nav aria-label="Service types" className="sticky top-16 z-30 bg-cream/90 backdrop-blur border-y border-gold/15">
          <div className={`${wrap} flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]`}>
            {[...CATEGORIES.map(c => ({ id: c.id, label: c.label, icon: c.id })), { id: 'bundles', label: 'Bundles', icon: 'box' }].map(l => (
              <a key={l.id} href={`#${l.id}`}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium text-navy/70
                  hover:bg-white hover:text-navy transition-colors">
                <ServiceIcon name={l.icon} className="w-4 h-4 text-gold" />
                {l.label}
              </a>
            ))}
          </div>
        </nav>

        {/* ── One section per kind of service, alternating backgrounds ── */}
        {CATEGORIES.map((cat, i) => {
          const items = services.filter(s => s.category === cat.id)
          const soon = categoryComingSoon(cat.id)
          return (
            <section key={cat.id} id={cat.id} className={`scroll-mt-32 py-24 md:py-28 ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}>
              <div className={wrap}>
                <div className="max-w-[640px] mb-12">
                  <div className={`${eyebrow} mb-3 flex items-center gap-2`}>
                    {cat.label}
                    {soon && <span className="text-[10px] tracking-wide bg-gold-pale text-[#8A6A1A] border border-gold/40 rounded-full px-2 py-0.5">Coming soon</span>}
                  </div>
                  <h2 className={h2} style={h2Style}>{cat.tagline}</h2>
                </div>

                <div className={`grid gap-6 sm:grid-cols-2 ${items.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                  {items.map(s => (
                    <ServiceCard key={s.slug} s={s} />
                  ))}
                </div>

                <ServiceChooser category={cat.id} />
              </div>
            </section>
          )
        })}

        {/* ── English score check ── */}
        <section id="score-check" className="scroll-mt-32 py-24 md:py-28 bg-navy">
          <div className={`${wrap} grid gap-12 lg:grid-cols-2 items-center`}>
            <div>
              <div className={`${eyebrow} mb-3`}>Quick check</div>
              <h2 className="font-display font-bold text-white text-balance" style={h2Style}>
                Is your English score enough for your scholarships?
              </h2>
              <p className="mt-5 text-[17px] leading-[1.7] text-white/60 max-w-[480px]">
                {ielts} scholarships in our list ask for IELTS and {toefl} ask for TOEFL. Pick your score to see how many
                you already qualify for, and how many more a better score would open up.
              </p>
            </div>
            <ScoreChecker />
          </div>
        </section>

        {/* ── Bundles ── */}
        <section id="bundles" className="scroll-mt-32 py-24 md:py-28 bg-cream">
          <div className={wrap}>
            <div className="max-w-[640px] mb-12">
              <div className={`${eyebrow} mb-3`}>Bundles</div>
              <h2 className={h2} style={h2Style}>Need more than one? Save with a bundle.</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-navy/60">
                A few services together, for less than buying each one.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 items-stretch">
              {bundles.map(b => (
                <BundleCard key={b.slug} b={b} services={services} highlight={b.slug === biggestSaving} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Call back ── */}
        <section className="py-24 md:py-28 bg-white">
          <div className={`${wrap} grid gap-14 lg:grid-cols-[0.9fr_1.1fr] items-start`}>
            <div className="lg:sticky lg:top-36">
              <div className={`${eyebrow} mb-3`}>How booking works</div>
              <h2 className={h2} style={h2Style}>Speak to a counsellor before you enrol.</h2>
              <ol className="mt-10 flex flex-col gap-7">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-5">
                    <span className="w-10 h-10 rounded-full bg-gold-pale text-[#8A6A1A] font-display font-bold text-[17px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="pt-1.5">
                      <h3 className="font-semibold text-navy text-[16px]">{step.title}</h3>
                      <p className="text-[15px] leading-relaxed text-navy/55 mt-0.5">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <EnquiryForm />
          </div>
        </section>

        {/* ── Questions ── */}
        <section className="py-24 md:py-28 bg-cream">
          <div className={wrap}>
            <div className="max-w-[760px] mx-auto">
              <div className="text-center mb-10">
                <div className={`${eyebrow} mb-3`}>Questions students ask</div>
                <h2 className={h2} style={h2Style}>Good to know</h2>
              </div>
              <div className="flex flex-col divide-y divide-gold/20 border-y border-gold/20">
                {FAQ.map(item => (
                  <details key={item.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-semibold text-navy
                      [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span className="w-8 h-8 rounded-full border border-gold/40 text-[#8A6A1A] flex items-center justify-center shrink-0
                        transition-transform group-open:rotate-45 text-[18px] leading-none" aria-hidden>+</span>
                    </summary>
                    <p className="mt-3 pr-14 text-[15px] leading-relaxed text-navy/60">{item.a}</p>
                  </details>
                ))}
              </div>
              <p className="mt-16 text-center text-[12px] text-navy/40 leading-relaxed">
                IELTS, TOEFL, PTE, GRE and GMAT are trademarks of their respective owners. GlobalReach is not affiliated with
                or endorsed by them; their names and logos are shown only to identify the tests we prepare you for. Prices are in Indian rupees.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
