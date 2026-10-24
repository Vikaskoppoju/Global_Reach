import { ENQUIRY_STATUSES, listEnquiries } from '@/lib/server/enquiries-repo'
import { handle } from '@/lib/server/api'
import type { EnquiryStatus } from '@/types'

export const dynamic = 'force-dynamic'

export function GET(req: Request) {
  const q = new URL(req.url).searchParams
  const status = q.get('status') ?? ''
  return handle(() => listEnquiries({
    status: ENQUIRY_STATUSES.includes(status as EnquiryStatus) ? status : undefined,
    limit: Math.min(Math.max(Number(q.get('limit')) || 50, 1), 200),
    beforeId: Number(q.get('before')) || undefined,
  }))
}
