import { createCountry } from '@/lib/server/atlas-repo'
import { handleWrite, actorFrom, readBody } from '@/lib/server/api'

export async function POST(req: Request) {
  const body = await readBody(req)
  return handleWrite(() => createCountry(body, actorFrom(req)), 201)
}
