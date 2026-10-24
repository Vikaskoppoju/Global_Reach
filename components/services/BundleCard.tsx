import ServiceIcon from '@/components/services/icons'
import { bundleBreakdown, formatINR, getService } from '@/lib/services'
import type { Service, ServiceBundle } from '@/types'

// Tests share one icon; other services have their own
const iconFor = (service: string) => (getService(service)?.exams ? 'test-prep' : service)

export default function BundleCard({ b, services, highlight = false }: { b: ServiceBundle; services: Service[]; highlight?: boolean }) {
  const { lines, separately, saving } = bundleBreakdown(b, services)

  return (
    <article className={`relative h-full rounded-3xl bg-white p-6 md:p-7 flex flex-col gap-5
      ${highlight ? 'border-2 border-gold shadow-[0_24px_60px_rgba(15,31,61,0.12)]' : b.comingSoon ? 'border border-dashed border-gold/40' : 'border border-gold/20'}`}>
      {highlight && (
        <span className="absolute -top-3 left-6 bg-gold text-navy text-[11px] font-bold uppercase tracking-wide rounded-full px-3 py-1">
          Biggest saving
        </span>
      )}

      <header className="flex items-start justify-between gap-3">
        <h3 className="font-display font-bold text-navy text-[22px] leading-tight">{b.name}</h3>
        {b.comingSoon && (
          <span className="text-[11px] font-bold uppercase tracking-wide bg-gold-pale text-[#8A6A1A] border border-gold/40 rounded-full px-2.5 py-1 whitespace-nowrap">
            Coming soon
          </span>
        )}
      </header>

      <p className="text-[14px] text-navy/75 bg-gold-pale rounded-xl px-3.5 py-2.5 leading-relaxed">
        <span className="font-semibold text-navy">Pick this if</span> {b.bestFor.charAt(0).toLowerCase() + b.bestFor.slice(1)}
      </p>

      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wide text-navy/45 mb-2.5">What you get</h4>
        <ul className="flex flex-col divide-y divide-gold/10">
          {lines.map(l => (
            <li key={l.label} className="flex items-start gap-2.5 py-2.5 text-[14px]">
              <span className="w-7 h-7 rounded-lg bg-gold-pale text-[#8A6A1A] flex items-center justify-center shrink-0 -mt-0.5">
                <ServiceIcon name={l.priceINR === null ? 'gift' : iconFor(l.service)} className="w-4 h-4" />
              </span>
              <span className="flex-1 text-navy/80">{l.label}</span>
              {!b.comingSoon && (
                l.priceINR !== null
                  ? <span className="text-navy/45 tabular-nums whitespace-nowrap">{formatINR(l.priceINR)}</span>
                  : <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 whitespace-nowrap">Free extra</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto rounded-2xl bg-cream p-4 flex flex-col gap-2">
        {b.comingSoon ? (
          <p className="text-[14px] text-navy/60">Price announced when it launches.</p>
        ) : (
          <>
            <div className="flex items-baseline justify-between text-[13px] text-navy/50">
              <span>If bought separately</span>
              <span className="line-through tabular-nums">{formatINR(separately)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[14px] font-semibold text-navy">Bundle price</span>
              <span className="font-display text-[28px] font-bold text-navy leading-none tabular-nums">{formatINR(b.priceINR)}</span>
            </div>
            {saving > 0 && (
              <span className="self-end text-[12px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                You save {formatINR(saving)}
              </span>
            )}
          </>
        )}
        <p className="text-[12px] text-navy/45">Takes about {b.duration}</p>
      </div>

      <a href={`?service=${b.slug}#enquire`}
        className={`text-center rounded-xl py-3 text-[14px] font-semibold transition-all hover:-translate-y-0.5
          ${highlight ? 'bg-gold text-navy hover:bg-gold-light' : 'bg-navy text-white hover:bg-navy-mid'}`}>
        {b.comingSoon ? 'Get notified' : 'Request a call back'}
      </a>
    </article>
  )
}
