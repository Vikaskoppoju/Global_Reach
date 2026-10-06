import 'server-only'
import { NextResponse } from 'next/server'
import { InputError, NotFoundError } from '@/lib/server/atlas-repo'
import { ATLAS_SOURCE } from '@/lib/atlas-source'

// Who made a change, for the activity log. The admin UI sends the signed-in user here.
// NOTE: login is still the demo in AuthContext, so this header is not verified; add real
// authentication before exposing the admin API publicly.
export function actorFrom(req: Request) {
  return (req.headers.get('x-admin-user') ?? '').trim().slice(0, 200) || 'unknown admin'
}

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  const body = await req.json().catch(() => null)
  return body && typeof body === 'object' ? body : {}
}

export function numericId(raw: string) {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) throw new NotFoundError('Not found.')
  return id
}

// For admin changes: refused when the app runs on the static snapshot (production by default),
// because those edits would not appear on the site until the next export and build
export function handleWrite(fn: () => Promise<unknown>, status = 200) {
  if (ATLAS_SOURCE === 'static') {
    return NextResponse.json({
      error: 'The atlas is read-only here because the site is running on the static snapshot. '
        + 'Make changes in development (npm run dev), then run npm run db:export and rebuild.',
    }, { status: 409 })
  }
  return handle(fn, status)
}

export async function handle(fn: () => Promise<unknown>, status = 200) {
  try {
    return NextResponse.json(await fn(), { status })
  } catch (err) {
    if (err instanceof InputError || err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    const code = (err as { code?: string })?.code
    if (code === 'ECONNREFUSED' || code === '57P03' || code === '3D000' || code === '28P01') {
      return NextResponse.json({ error: 'The database is not reachable. Start it with `npm run db:up`.' }, { status: 503 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong while saving. Check the server log.' }, { status: 500 })
  }
}
