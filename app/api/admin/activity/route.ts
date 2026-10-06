import { listActivity } from '@/lib/server/atlas-repo'
import { handle } from '@/lib/server/api'

export const dynamic = 'force-dynamic'

const ENTITIES = new Set(['continent', 'country', 'university', 'atlas'])
const ACTIONS = new Set(['create', 'update', 'delete', 'seed'])

export function GET(req: Request) {
  const q = new URL(req.url).searchParams
  const entity = q.get('entity') ?? ''
  const action = q.get('action') ?? ''
  return handle(() => listActivity({
    entity: ENTITIES.has(entity) ? entity : undefined,
    action: ACTIONS.has(action) ? action : undefined,
    limit: Math.min(Math.max(Number(q.get('limit')) || 50, 1), 200),
    beforeId: Number(q.get('before')) || undefined,
  }))
}
