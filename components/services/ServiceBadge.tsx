import ServiceIcon from '@/components/services/icons'
import TestLogo from '@/components/services/TestLogo'
import type { Service } from '@/types'

// Short name shown beside the icon for services that have no logo of their own
const BADGE_LABEL: Record<string, string> = {
  sop: 'SOP review',
  'sop-coaching': 'SOP coaching',
  'scholarship-essay': 'Essays',
  'lor-cv': 'LOR & CV',
  'admission-interview': 'Admission',
  'scholarship-interview': 'Panel',
  'visa-interview': 'Visa',
}

const SIZES = {
  // Cards
  md: { tile: 'h-16 w-36', icon: 'w-10 h-10 rounded-xl', svg: 'w-5 h-5', text: 'text-[14px]' },
  // Page headers
  lg: { tile: 'h-20 w-44', icon: 'w-12 h-12 rounded-xl', svg: 'w-6 h-6', text: 'text-[16px]' },
}

// A test's logo, or an icon tile of the same size, so every service has a picture
export default function ServiceBadge({ s, size = 'md' }: { s: Service; size?: keyof typeof SIZES }) {
  const z = SIZES[size]
  if (s.exams) return <TestLogo s={s} className={z.tile} />
  return (
    <span className={`flex items-center gap-2.5 rounded-2xl bg-white border border-gold/20 px-3 shrink-0 ${z.tile}`}>
      <span className={`bg-navy text-gold-light flex items-center justify-center shrink-0 ${z.icon}`}>
        <ServiceIcon name={s.slug} className={z.svg} />
      </span>
      <span className={`font-display font-bold text-navy leading-tight ${z.text}`}>{BADGE_LABEL[s.slug] ?? s.name}</span>
    </span>
  )
}

// Just the picture, small, for lists such as "Which one do I need?"
export function ServiceMark({ s }: { s: Service }) {
  if (s.exams) return <TestLogo s={s} className="h-10 w-20 !rounded-xl !px-2 !py-1" />
  return (
    <span className="w-10 h-10 rounded-xl bg-navy text-gold-light flex items-center justify-center shrink-0">
      <ServiceIcon name={s.slug} className="w-5 h-5" />
    </span>
  )
}
