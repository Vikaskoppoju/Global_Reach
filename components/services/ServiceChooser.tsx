import Link from 'next/link'
import { CHOOSERS, getService } from '@/lib/services'
import { ServiceMark } from '@/components/services/ServiceBadge'
import type { ServiceCategory } from '@/types'

// "Which one do I need?", folded away under the cards so the section stays calm.
// Opens to the student's situation on the left and the service that fits on the right, plus the words they'll meet.
export default function ServiceChooser({ category }: { category: ServiceCategory }) {
  const chooser = CHOOSERS[category]
  if (!chooser) return null

  return (
    <details className="group mt-10 rounded-2xl border border-gold/25 bg-white/60 open:bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-semibold text-navy">
          Not sure which one you need? <span className="font-normal text-navy/55">See which one fits your situation.</span>
        </span>
        <svg className="w-5 h-5 text-gold shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2}
          viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="grid gap-8 border-t border-gold/15 px-6 py-6 lg:grid-cols-[1.5fr_1fr]">
        <ul className="flex flex-col divide-y divide-gold/10">
          {chooser.rows.map(row => {
            const s = getService(row.service)
            if (!s) return null
            return (
              <li key={row.service}>
                <Link href={`/services/${s.slug}`}
                  className="group/row flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-1 py-3 -mx-2 px-2 rounded-xl hover:bg-cream transition-colors">
                  <span className="w-20 flex justify-center shrink-0"><ServiceMark s={s} /></span>
                  <span className="flex-1 min-w-[180px] text-[14px] text-navy/70">“{row.situation}”</span>
                  <span className="text-[14px] font-semibold text-navy group-hover/row:text-gold transition-colors whitespace-nowrap">
                    {s.name} →
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        <dl className="flex flex-col gap-4 lg:border-l lg:border-gold/15 lg:pl-8">
          {chooser.glossary.map(g => (
            <div key={g.term}>
              <dt className="text-[14px] font-semibold text-navy">{g.term}</dt>
              <dd className="text-[13px] leading-relaxed text-navy/60">{g.meaning}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  )
}
