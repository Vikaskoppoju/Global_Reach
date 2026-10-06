import { getAtlas } from '@/lib/server/atlas-repo'
import { handle } from '@/lib/server/api'
import { ATLAS_SOURCE } from '@/lib/atlas-source'
import { continents } from '@/lib/data'

export const dynamic = 'force-dynamic'

export function GET() {
  // Static mode serves the bundled snapshot so the endpoint works without a database
  return handle(async () => (ATLAS_SOURCE === 'static' ? continents : getAtlas()))
}
