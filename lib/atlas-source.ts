// Which atlas the app uses, fixed at build/start time by next.config.mjs:
//   'db'     — PostgreSQL via /api/atlas; editable in /admin (development default)
//   'static' — the bundled JSON snapshot in lib/; read-only (production default)
export type AtlasSource = 'db' | 'static'

export const ATLAS_SOURCE: AtlasSource = process.env.NEXT_PUBLIC_ATLAS_SOURCE === 'static' ? 'static' : 'db'
