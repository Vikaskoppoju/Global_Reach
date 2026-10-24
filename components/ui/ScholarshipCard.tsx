import Image from 'next/image'
import DeadlineBadge from '@/components/ui/DeadlineBadge'
import UniversityLogo from '@/components/ui/UniversityLogo'
import { flagUrl, fundingLabel } from '@/lib/scholarships'
import type { Scholarship } from '@/types'

// University name → logo for every university in the atlas (undefined when it has no logo)
export type LogoMap = Map<string, string | undefined>

const FUNDING_COLORS: Record<string, string> = {
  'Fully funded': 'bg-green-100 text-green-700',
  'Partially funded': 'bg-blue-100 text-blue-700',
  'Need-based': 'bg-purple-100 text-purple-700',
}

export function Flag({ country, className = 'w-7 h-5' }: { country: string; className?: string }) {
  const src = flagUrl(country)
  if (!src) return null
  return <Image src={src} alt="" width={28} height={20} className={`${className} rounded-[3px] object-cover ring-1 ring-navy/10`} />
}

function joinCountries(countries: string[], max = 2) {
  return countries.length > max
    ? `${countries.slice(0, max).join(', ')} +${countries.length - max}`
    : countries.join(', ')
}

// Header: the university the scholarship is for, else the study country, else "various countries"
function Where({ s, logos }: { s: Scholarship; logos: LogoMap }) {
  const universities = s.universities ?? []
  const studyIn = s.studyIn ?? []

  if (universities.length) {
    const first = universities[0]
    return (
      <div className="flex items-center gap-3 min-w-0">
        <UniversityLogo name={first} logo={logos.get(first)} size="lg" tone="light" />
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-navy leading-snug line-clamp-2">{first}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-navy/55">
            {studyIn[0] && <Flag country={studyIn[0]} className="w-4 h-3" />}
            <span className="truncate">
              {joinCountries(studyIn)}
              {universities.length > 1 && ` · +${universities.length - 1} more ${universities.length === 2 ? 'university' : 'universities'}`}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (studyIn.length) {
    return (
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex -space-x-2 shrink-0">
          {studyIn.slice(0, 3).map(c => <Flag key={c} country={c} className="w-10 h-7" />)}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-navy leading-snug truncate">{joinCountries(studyIn)}</div>
          <div className="text-[11px] text-navy/55">Any eligible university</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-full bg-gold-pale text-[#8A6A1A] flex items-center justify-center shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
        </svg>
      </span>
      <div>
        <div className="text-[13px] font-semibold text-navy">Various countries</div>
        <div className="text-[11px] text-navy/55">Not tied to one country</div>
      </div>
    </div>
  )
}

// Compact version for the home page: who it is for, where, funding and deadline
export function ScholarshipTile({ s, logos, onSelect }: { s: Scholarship; logos: LogoMap; onSelect: () => void }) {
  const funding = fundingLabel(s)
  const universities = s.universities ?? []
  const studyIn = s.studyIn ?? []
  const where = universities.length
    ? `${universities[0]}${universities.length > 1 ? ` +${universities.length - 1}` : ''}`
    : studyIn.length ? `Any university in ${joinCountries(studyIn)}` : 'Various countries'

  return (
    <button type="button" onClick={onSelect}
      className="group w-full h-full text-left bg-white rounded-2xl border border-gold/15 p-5 flex flex-col gap-4
        shadow-[0_2px_10px_rgba(15,31,61,0.04)] hover:shadow-[0_18px_40px_rgba(15,31,61,0.12)] hover:-translate-y-1
        hover:border-gold/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      <div className="flex items-start gap-4">
        {universities.length ? (
          <UniversityLogo name={universities[0]} logo={logos.get(universities[0])} size="lg" tone="light" />
        ) : studyIn.length ? (
          <span className="w-14 h-14 rounded-xl bg-cream flex items-center justify-center shrink-0 ring-1 ring-gold/20">
            <Flag country={studyIn[0]} className="w-9 h-6" />
          </span>
        ) : (
          <span className="w-14 h-14 rounded-xl bg-gold-pale text-[#8A6A1A] flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
            </svg>
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-display font-bold text-navy text-[17px] leading-snug line-clamp-2 group-hover:text-navy-mid">{s.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-navy/55 min-w-0">
            {universities.length > 0 && studyIn[0] && <Flag country={studyIn[0]} className="w-4 h-3" />}
            <span className="truncate">{where}</span>
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-gold/10">
        {funding
          ? <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${FUNDING_COLORS[funding]}`}>{funding}</span>
          : <span />}
        <span className="text-[12px] text-navy/50 text-right">
          Deadline <DeadlineBadge deadline={s.deadline} />
        </span>
      </div>
    </button>
  )
}

export default function ScholarshipCard({ s, logos, onSelect }: { s: Scholarship; logos: LogoMap; onSelect: () => void }) {
  const funding = fundingLabel(s)
  return (
    <button type="button" onClick={onSelect}
      className="w-full h-full text-left bg-white rounded-2xl border border-gold/15 overflow-hidden flex flex-col
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      <div className="relative bg-cream/70 border-b border-gold/10 px-5 py-4 min-h-[88px] flex items-center">
        <Where s={s} logos={logos} />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="text-[11px] font-bold text-gold uppercase tracking-wide line-clamp-1">{s.provider}</div>
          {funding && (
            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${FUNDING_COLORS[funding]}`}>{funding}</span>
          )}
        </div>
        <h3 className="font-display font-bold text-navy text-[15px] leading-tight mb-2 line-clamp-2">{s.name}</h3>
        <p className="text-[12px] text-navy/50 leading-relaxed mb-3 line-clamp-2">{s.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-gold/10">
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-navy line-clamp-1">{s.amount}</div>
            <div className="text-[11px] text-navy/40 line-clamp-1">{s.duration}</div>
          </div>
          <div className="text-right shrink-0 max-w-[45%]">
            <div className="text-[11px] font-semibold text-navy/50">Deadline</div>
            <div className="line-clamp-2"><DeadlineBadge deadline={s.deadline} /></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {s.levels.map(l => (
            <span key={l} className="text-[10px] bg-cream text-navy/60 px-2 py-0.5 rounded-full border border-gold/15">{l}</span>
          ))}
        </div>
      </div>
    </button>
  )
}
