import { updateUniversity, deleteUniversity } from '@/lib/server/atlas-repo'
import { handleWrite, actorFrom, readBody, numericId } from '@/lib/server/api'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await readBody(req)
  return handleWrite(() => updateUniversity(numericId(params.id), body, actorFrom(req)))
}

export function DELETE(req: Request, { params }: { params: { id: string } }) {
  return handleWrite(() => deleteUniversity(numericId(params.id), actorFrom(req)))
}
