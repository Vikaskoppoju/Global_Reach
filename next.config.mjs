// Where the atlas (continents → countries → universities) comes from:
//   'db'     — PostgreSQL, editable in /admin (default for `next dev`)
//   'static' — the JSON snapshot in lib/, read-only (default for `next build` / production)
// Override with ATLAS_SOURCE=db|static. See .claude/skills/atlas-data/SKILL.md.
const atlasSource = process.env.ATLAS_SOURCE ?? (process.env.NODE_ENV === 'production' ? 'static' : 'db')
if (!['db', 'static'].includes(atlasSource)) {
  throw new Error(`ATLAS_SOURCE must be "db" or "static", got "${atlasSource}"`)
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_ATLAS_SOURCE: atlasSource,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  }
}
export default nextConfig
