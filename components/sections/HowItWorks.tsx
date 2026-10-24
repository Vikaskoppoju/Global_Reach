'use client'

import { useState } from 'react'
import Image from 'next/image'
import AnimatedSection from '@/components/ui/AnimatedSection'
import { ART } from '@/lib/illustrations'

interface Step { title: string; text: string; href: string; cta: string }

const PREPARE: Step = {
  title: 'Prepare & apply',
  text: 'Reach the score you need, get your SOP and essays reviewed and practise for interviews. Then apply on time.',
  href: '/services',
  cta: 'See services',
}

// The whole journey for each starting point in the hero, so students know what comes next
const ROUTES = {
  scholarship: {
    label: 'Start with a scholarship',
    steps: [
      {
        title: 'Shortlist scholarships',
        text: 'Filter by level, country and subject, and add your grades to see the ones you qualify for. Each comes with its university.',
        href: '/scholarships',
        cta: 'Find scholarships',
      },
      {
        title: 'Check what it asks for',
        text: 'See its deadline, amount and the English score it needs, then check if your score is enough.',
        href: '/services#score-check',
        cta: 'Check my English score',
      },
      PREPARE,
    ],
  },
  university: {
    label: 'Start with a university',
    steps: [
      {
        title: 'Pick a university',
        text: 'Browse by region and country, or search by name. Every one accepts international students.',
        href: '/universities',
        cta: 'Browse universities',
      },
      {
        title: 'See its scholarships',
        text: 'Each university lists the scholarships you can use there. Open one to see its deadline, amount and English score.',
        href: '/services#score-check',
        cta: 'Check my English score',
      },
      PREPARE,
    ],
  },
} satisfies Record<string, { label: string; steps: Step[] }>

type Route = keyof typeof ROUTES

const WORDS = [
  { word: 'Fully funded', meaning: 'Pays your tuition and usually your living costs too.' },
  { word: 'Partially funded', meaning: 'Pays part of the cost, for example some of the tuition.' },
  { word: 'Need-based', meaning: 'Given to students whose families need help paying.' },
  { word: 'Merit-based', meaning: 'Given for strong grades, test scores or achievements.' },
  { word: 'Deadline', meaning: 'The last day you can apply. It is best to apply early!' },
  { word: 'SOP', meaning: 'Statement of Purpose: a short essay on why you want to study this course.' },
]

export default function HowItWorks() {
  const [route, setRoute] = useState<Route>('scholarship')
  const steps = ROUTES[route].steps

  return (
    <section id="how-it-works" className="bg-white py-14 md:py-16 px-5 md:px-10 lg:px-16 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto">
        {/* Heading and route switch, with a small illustration beside them on wide screens */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center mb-8">
          <AnimatedSection>
            <div className="section-tag">How it works</div>
            <h2 className="font-display font-bold text-navy leading-tight mb-2"
              style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', letterSpacing: '-1px' }}>
              From search to <em className="text-gold">offer letter</em>
            </h2>
            <p className="text-[15px] leading-relaxed text-navy/60 mb-5">
              Three steps either way. You can do the first two on your own, for free.
            </p>
            <div className="flex w-full sm:w-auto sm:inline-flex rounded-full bg-cream border border-gold/25 p-1"
              role="group" aria-label="Where are you starting?">
              {(Object.keys(ROUTES) as Route[]).map(id => (
                <button key={id} type="button" onClick={() => setRoute(id)} aria-pressed={route === id}
                  className={`flex-1 sm:flex-none rounded-full px-4 sm:px-6 py-2.5 text-[13px] sm:text-[14px] font-semibold transition-colors
                    ${route === id ? 'bg-navy text-white shadow-sm' : 'text-navy/60 hover:text-navy'}`}>
                  {ROUTES[id].label}
                </button>
              ))}
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1} direction="scale" className="hidden lg:block rounded-3xl bg-gold-pale p-6">
            <div className="relative h-36">
              <Image src={ART.journey} alt="" fill className="object-contain" />
            </div>
          </AnimatedSection>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            // Keyed by route so the steps animate in again after switching
            <li key={`${route}-${step.title}`}>
              <AnimatedSection delay={i * 0.08}
                className="h-full flex flex-col rounded-2xl border border-gold/15 bg-cream/60 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-navy text-gold-light font-display font-bold text-[15px]
                    flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold text-navy text-[16px]">{step.title}</h3>
                </div>
                <p className="text-[14px] leading-relaxed text-navy/60 mb-3">{step.text}</p>
                <a href={step.href} className="mt-auto text-[13px] font-semibold text-gold hover:text-navy transition-colors">
                  {step.cta} →
                </a>
              </AnimatedSection>
            </li>
          ))}
        </ol>

        <details id="scholarship-words" className="group mt-6 rounded-2xl bg-gold-pale border border-gold/25 scroll-mt-24">
          <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-5 md:px-7">
            <span>
              <span className="block font-semibold text-navy text-[16px]">New to scholarships?</span>
              <span className="block text-[13px] text-navy/60">The words you will see most often, explained simply</span>
            </span>
            <span className="w-8 h-8 rounded-full bg-white border border-gold/30 flex items-center justify-center text-navy
              transition-transform group-open:rotate-45 shrink-0" aria-hidden>+</span>
          </summary>
          <div className="px-5 md:px-7 pb-6">
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 pt-2">
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
        </details>
      </div>
    </section>
  )
}
