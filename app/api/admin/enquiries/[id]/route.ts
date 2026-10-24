import { updateEnquiryStatus } from '@/lib/server/enquiries-repo'
import { handle, numericId, readBody } from '@/lib/server/api'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await readBody(req)
  return handle(async () => updateEnquiryStatus(numericId(params.id), body.status))
}
