import { saveUpload } from '@/lib/server/uploads-repo'
import { InputError } from '@/lib/server/atlas-repo'
import { handleWrite, actorFrom } from '@/lib/server/api'

// Multipart upload with a single "file" field; returns { id, url } for use as a logo
export async function POST(req: Request) {
  const actor = actorFrom(req)
  return handleWrite(async () => {
    const form = await req.formData().catch(() => null)
    const file = form?.get('file')
    if (!(file instanceof File)) throw new InputError('Choose an image to upload.')
    return saveUpload(file, actor)
  }, 201)
}
