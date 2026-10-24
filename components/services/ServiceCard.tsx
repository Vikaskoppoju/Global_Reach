import Link from 'next/link'
import ServiceBadge from '@/components/services/ServiceBadge'
import ServiceIcon from '@/components/services/icons'
import { formatINR, startingPrice } from '@/lib/services'
import type { Service } from '@/types'

// Kept to four things: picture, name, one line, price. The service page has the detail.
export default function ServiceCard({ s }: { s: Service }) {
  const from = startingPrice(s)
  const hasFree = s.packages.some(p => p.priceINR === 0)
  return (
    <Link href={`/services/${s.slug}`}
      className={`group h-full rounded-3xl border p-7 flex flex-col transition-all duration-300
        hover:shadow-[0_20px_50px_rgba(15,31,61,0.10)] hover:-translate-y-1 hover:border-gold/50
        ${s.comingSoon ? 'border-dashed border-gold/40 bg-white/60' : 'border-gold/20 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        {/* Tests show their logo; other services just their icon, since the title sits right below */}
        {s.exams ? <ServiceBadge s={s} /> : (
          <span className="w-14 h-14 rounded-2xl bg-navy text-gold-light flex items-center justify-center">
            <ServiceIcon name={s.slug} className="w-6 h-6" />
          </span>
        )}
        {s.comingSoon ? (
          <span className="text-[11px] font-bold bg-gold-pale text-[#8A6A1A] border border-gold/40 rounded-full px-2.5 py-1 whitespace-nowrap">
            Coming soon
          </span>
        ) : hasFree && (
          <span className="text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-1 whitespace-nowrap">
            Free test
          </span>
        )}
      </div>

      <h3 className="mt-6 font-display font-bold text-navy text-[21px] leading-snug">{s.name}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-navy/60">{s.short}</p>

      <div className="mt-auto pt-6 flex items-center justify-between gap-3">
        <span className="text-[14px] text-navy/50">
          {s.comingSoon ? 'Launching soon' : <>From <strong className="text-[17px] text-navy">{formatINR(from)}</strong></>}
        </span>
        <span className="w-9 h-9 rounded-full bg-cream text-navy flex items-center justify-center transition-colors group-hover:bg-navy group-hover:text-white"
          aria-hidden>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
