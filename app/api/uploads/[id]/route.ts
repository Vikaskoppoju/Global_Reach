import { NextResponse } from 'next/server'
import { getUpload } from '@/lib/server/uploads-repo'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const upload = Number.isInteger(id) && id > 0 ? await getUpload(id).catch(() => null) : null
  if (!upload) return new NextResponse('Not found', { status: 404 })
  return new NextResponse(new Uint8Array(upload.data), {
    headers: {
      'Content-Type': upload.contentType,
      // An upload never changes (a new logo gets a new id), so browsers can cache it for good
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
