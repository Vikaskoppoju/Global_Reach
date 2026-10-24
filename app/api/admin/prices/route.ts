import { listPrices, updatePrices } from '@/lib/server/prices-repo'
import { actorFrom, handle, handleWrite, readBody } from '@/lib/server/api'
import { ATLAS_SOURCE } from '@/lib/atlas-source'

export const dynamic = 'force-dynamic'

export function GET() {
  return handle(async () => ({ readOnly: ATLAS_SOURCE === 'static', ...(await listPrices()) }))
}

// Body: { prices: { [key]: rupees } }. Only prices that differ from the current ones are saved.
export async function PUT(req: Request) {
  const body = await readBody(req)
  return handleWrite(() => updatePrices(body, actorFrom(req)))
}
