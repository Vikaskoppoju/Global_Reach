import { updateCountry, deleteCountry } from '@/lib/server/atlas-repo'
import { handleWrite, actorFrom, readBody, numericId } from '@/lib/server/api'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await readBody(req)
  return handleWrite(() => updateCountry(numericId(params.id), body, actorFrom(req)))
}

export function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handleWrite(() => deleteCountry(numericId(params.id), actorFrom(req)))
}
