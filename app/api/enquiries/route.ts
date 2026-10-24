import { NextResponse } from 'next/server'
import { InputError } from '@/lib/server/atlas-repo'
import { createEnquiry } from '@/lib/server/enquiries-repo'
import { readBody } from '@/lib/server/api'

export const dynamic = 'force-dynamic'

// Public: the enquiry form on the services pages. Not tied to the atlas source, so it also
// works in production whenever DATABASE_URL points at a reachable database.
export async function POST(req: Request) {
  const body = await readBody(req)
  // Honeypot field, hidden from people; bots tend to fill it in
  if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ id: 0 }, { status: 201 })
  try {
    return NextResponse.json(await createEnquiry(body), { status: 201 })
  } catch (err) {
    if (err instanceof InputError) return NextResponse.json({ error: err.message }, { status: 400 })
    console.error(err)
    return NextResponse.json(
      { error: 'We couldn’t send your request right now. Please try again in a few minutes.' },
      { status: 503 })
  }
}
