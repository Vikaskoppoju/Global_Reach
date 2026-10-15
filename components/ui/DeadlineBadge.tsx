import { deadlineInfo } from '@/lib/scholarships'

export default function DeadlineBadge({ deadline }: { deadline: string }) {
  const info = deadlineInfo(deadline)
  if (info.kind === 'text') return <span className="text-[11px] text-navy/50">{info.label}</span>
  if (info.daysLeft < 0) return <span className="text-[11px] text-red-500 font-semibold">Closed</span>
  if (info.daysLeft < 30) return <span className="text-[11px] text-orange-500 font-bold">{info.daysLeft}d left</span>
  return <span className="text-[11px] text-navy/50">{info.label}</span>
}
