import Image from 'next/image'
import type { Service } from '@/types'

// The test's own logo on a white tile; tests without a logo file show their name instead
export default function TestLogo({ s, className = 'h-16 w-36' }: { s: Service; className?: string }) {
  const exam = s.exams?.[0] ?? s.name
  return (
    <span className={`relative flex items-center justify-center rounded-2xl bg-white border border-gold/20 px-3 py-2 shrink-0 ${className}`}>
      {s.logo ? (
        <span className="relative block w-full h-full">
          <Image src={s.logo} alt={`${exam} logo`} fill unoptimized sizes="160px" className="object-contain" />
        </span>
      ) : (
        <span className="font-display font-bold text-navy text-[22px] tracking-tight">{exam}</span>
      )}
    </span>
  )
}
