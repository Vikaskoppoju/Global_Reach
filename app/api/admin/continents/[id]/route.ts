import { updateContinent, deleteContinent } from '@/lib/server/atlas-repo'
import { handleWrite, actorFrom, readBody } from '@/lib/server/api'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await readBody(req)
  return handleWrite(() => updateContinent(params.id, body, actorFrom(req)))
}

export function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handleWrite(() => deleteContinent(params.id, actorFrom(req)))
}
