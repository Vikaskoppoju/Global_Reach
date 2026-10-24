import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import ServiceCard from '@/components/services/ServiceCard'
import ServiceIcon from '@/components/services/icons'
import EnquiryForm from '@/components/services/EnquiryForm'
import ServiceBadge from '@/components/services/ServiceBadge'
import {
  CATEGORIES, SERVICES, bundleBreakdown, bundleServices, formatINR, getService, startingPrice,
} from '@/lib/services'
import { getCatalogue } from '@/lib/server/catalogue'
import scholarships from '@/lib/scholarships.json'

export function generateStaticParams() {
  return SERVICES.map(s => ({ slug: s.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = getService(params.slug)
  if (!s) return {}
  return { title: `${s.name} — GlobalReach`, description: s.short }
}

const h2Cls = 'font-display font-bold text-navy text-[24px] mb-4 flex items-center gap-3'

// Section heading with a small icon in front
function Heading({ icon, children, small = false }: { icon: string; children: React.ReactNode; small?: boolean }) {
  return (
    <h2 className={small ? 'font-display font-bold text-navy text-[19px] mb-2 flex items-center gap-2.5' : h2Cls}>
      <span className={`rounded-xl bg-navy text-gold-light flex items-center justify-center shrink-0 ${small ? 'w-8 h-8' : 'w-10 h-10'}`}>
        <ServiceIcon name={icon} className={small ? 'w-4 h-4' : 'w-5 h-5'} />
      </span>
      {children}
    </h2>
  )
}

function Fact({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-9 h-9 rounded-xl bg-white/10 text-gold-light flex items-center justify-center shrink-0">
        <ServiceIcon name={icon} className="w-[18px] h-[18px]" />
      </span>
      <div><dt className="text-white/40 text-[12px]">{label}</dt><dd className="text-white font-semibold">{children}</dd></div>
    </div>
  )
}

// Heading for the "what is it" box; tests use "What is IELTS?" and so on
const WHAT_IS_IT_TITLE: Record<string, string> = {
  sop: 'What is an SOP?',
  'sop-coaching': 'What is an SOP?',
  'scholarship-essay': 'What is a scholarship essay?',
  'lor-cv': 'What are an LOR and a CV?',
  'admission-interview': 'What is an admission interview?',
  'scholarship-interview': 'What is a scholarship panel interview?',
  'visa-interview': 'What is a visa interview?',
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const { services, bundles } = await getCatalogue()
  const s = services.find(o => o.slug === params.slug)
  if (!s) notFound()

  const category = CATEGORIES.find(c => c.id === s.category)!
  const related = services.filter(o => o.category === s.category && o.slug !== s.slug).slice(0, 3)
  const bundle = bundles.find(b => bundleServices(b).includes(s.slug))
  const bundleSaving = bundle ? bundleBreakdown(bundle, services).saving : 0
  // Scholarships that list this exam, as a reason to prepare
  const needing = s.exams
    ? scholarships.filter(sc => sc.requirements.exams.some(e => s.exams!.some(x => e.toUpperCase().startsWith(x)))).length
    : 0
  const whatIsItTitle = WHAT_IS_IT_TITLE[s.slug] ?? (s.exams ? `What is ${s.exams[0]}?` : 'What is this?')

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream">
        <div className="bg-navy px-5 md:px-10 lg:px-16 pt-32 pb-14 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 70% 50%, #C9A84C 0%, transparent 60%)' }} />
          <div className="relative z-10 max-w-4xl">
            <nav className="text-[13px] text-white/50 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white transition-colors">Overview</Link>
              <span className="mx-2">/</span>
              <Link href="/services" className="hover:text-white transition-colors">Services</Link>
              <span className="mx-2">/</span>
              <span className="text-white/75">{s.name}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-gold text-[11px] font-bold tracking-[2px] uppercase">{category.label}</span>
              {s.comingSoon && (
                <span className="text-[10px] font-bold uppercase tracking-wide bg-gold text-navy rounded-full px-2.5 py-0.5">Coming soon</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-5 mb-4">
              <ServiceBadge s={s} size="lg" />
              <h1 className="font-display font-bold text-white"
                style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                {s.name}
              </h1>
            </div>
            <p className="text-white text-[18px] leading-relaxed max-w-2xl">{s.short}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#enquire"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-navy text-[14px] font-semibold hover:bg-gold-light transition-all">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden><path strokeLinejoin="round" d="M5 4h3.5l1.8 4.4-2.2 1.4a11 11 0 0 0 6.1 6.1l1.4-2.2L20 15.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" /></svg>
                {s.comingSoon ? 'Get notified' : 'Request a call back'}
              </a>
              {!s.comingSoon && <span className="text-[13px] text-white/55">Free consultation with a counsellor. No upfront payment.</span>}
            </div>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[14px]">
              {!s.comingSoon && (
                <Fact icon="tag" label="Price"><span className="text-gold">From {formatINR(startingPrice(s))}</span></Fact>
              )}
              <Fact icon="laptop" label="How">{s.format}</Fact>
              <Fact icon="clock" label="Takes">{s.duration}</Fact>
              {needing > 0 && (
                <Fact icon="scholarship" label="Asked for by">
                  <Link href="/scholarships" className="text-gold hover:text-gold-light">{needing} scholarships in our list</Link>
                </Fact>
              )}
            </dl>
          </div>
        </div>

        <div className="px-5 md:px-10 lg:px-16 py-12 max-w-[1300px] mx-auto grid gap-10 lg:grid-cols-[1.2fr_1fr] items-start">
          <div className="flex flex-col gap-10 min-w-0">
            {s.comingSoon && (
              <p className="rounded-2xl bg-gold-pale border border-gold/30 px-5 py-4 text-[14px] text-navy/75">
                <strong className="text-navy">Coming soon.</strong> We’re getting our mentors ready. Here’s what we plan to offer.
                Leave your details and we’ll tell you as soon as booking opens.
              </p>
            )}

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white border border-gold/20 p-6">
                <Heading icon="info" small>{whatIsItTitle}</Heading>
                <p className="text-[14px] leading-relaxed text-navy/70">{s.whatIsIt}</p>
              </div>
              <div className="rounded-3xl bg-gold-pale border border-gold/25 p-6">
                <Heading icon="target" small>Is this for you?</Heading>
                <p className="text-[14px] leading-relaxed text-navy/70">{s.bestFor}</p>
                <Link href={`/services#${s.category}`} className="mt-3 inline-block text-[13px] font-semibold text-[#8A6A1A] hover:text-navy">
                  Not sure? Compare all {category.label.toLowerCase()} →
                </Link>
              </div>
            </section>

            <section>
              <Heading icon="steps">How it works</Heading>
              <ol className="flex flex-col gap-3">
                {s.steps.map((step, i) => (
                  <li key={step} className="flex gap-4 rounded-2xl bg-white border border-gold/20 p-4">
                    <span className="w-9 h-9 rounded-full bg-navy text-gold-light font-display font-bold text-[16px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-[14px] leading-relaxed text-navy/75 pt-1.5">{step}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[14px] leading-relaxed text-navy/60">{s.description}</p>
            </section>

            <section>
              <Heading icon="box">What you get</Heading>
              <ul className="grid gap-3 sm:grid-cols-2">
                {s.includes.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-navy/75">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ServiceIcon name="check" className="w-3 h-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <Heading icon="tag">{s.comingSoon ? 'Planned options' : 'Options and prices'}</Heading>
              {!s.comingSoon && (
                <p className="-mt-1 mb-4 rounded-2xl bg-gold-pale border border-gold/25 px-4 py-3 text-[14px] text-navy/75 leading-relaxed">
                  <strong className="text-navy">Enrolment is handled by our counsellors.</strong> Choose an option and share your details.
                  We’ll call you to confirm the best fit, then send a secure payment link to complete your enrolment.
                </p>
              )}
              <ul className="flex flex-col gap-3">
                {s.packages.map(p => (
                  <li key={p.name} className="rounded-2xl bg-white border border-gold/20 p-5 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[220px]">
                      <h3 className="font-bold text-navy text-[16px] flex flex-wrap items-center gap-2">
                        {p.name}
                        {p.priceINR === 0 && (
                          <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">Free</span>
                        )}
                      </h3>
                      <p className="text-[14px] text-navy/65 mt-1">{p.detail}</p>
                      {p.goodIf && (
                        <p className="text-[13px] text-[#8A6A1A] mt-1.5"><span className="font-semibold">Good if:</span> {p.goodIf.charAt(0).toLowerCase() + p.goodIf.slice(1)}</p>
                      )}
                    </div>
                    {!s.comingSoon && (
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[20px] font-bold text-navy">{formatINR(p.priceINR)}</div>
                          {p.per && <div className="text-[12px] text-navy/45">{p.per}</div>}
                        </div>
                        <a href={`?package=${encodeURIComponent(p.name)}#enquire`}
                          className="px-4 py-2 rounded-full bg-navy text-white text-[13px] font-semibold hover:bg-navy-mid transition-all whitespace-nowrap">
                          {p.priceINR === 0 ? 'Request free test' : 'Request a call back'}
                        </a>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            {bundle && !bundle.comingSoon && (
              <section className="rounded-3xl bg-navy text-white p-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[220px]">
                  <div className="text-gold text-[11px] font-bold uppercase tracking-[2px] mb-1">Save with a bundle</div>
                  <h2 className="font-display font-bold text-[20px]">{bundle.name} · {formatINR(bundle.priceINR)}</h2>
                  <p className="text-[14px] text-white/65 mt-1">
                    {bundle.items.map(i => i.label).join(' · ')}
                    {bundleSaving > 0 && <span className="text-gold-light font-semibold"> · You save {formatINR(bundleSaving)}</span>}
                  </p>
                </div>
                <a href={`?service=${bundle.slug}#enquire`} className="px-5 py-2.5 rounded-full bg-gold text-navy text-[13px] font-semibold hover:bg-gold-light transition-all">
                  Request a call back
                </a>
              </section>
            )}

            {related.length > 0 && (
              <section>
                <Heading icon={s.category}>Other {category.label.toLowerCase()}</Heading>
                <div className="grid gap-5 sm:grid-cols-2">
                  {related.map(r => <ServiceCard key={r.slug} s={r} />)}
                </div>
              </section>
            )}
          </div>

          <div className="lg:sticky lg:top-24">
            <EnquiryForm service={s.slug} />
          </div>
        </div>

        <p className="px-5 md:px-10 lg:px-16 pb-12 max-w-[1300px] mx-auto text-[12px] text-navy/40 leading-relaxed">
          {s.exams ? `${s.exams.join(', ')} is a trademark of its owner. GlobalReach is not affiliated with or endorsed by it. ` : ''}
          Prices are in Indian rupees. We give coaching and feedback and never guarantee a score, an admission or a visa.
        </p>
      </main>
      <Footer />
    </>
  )
}
