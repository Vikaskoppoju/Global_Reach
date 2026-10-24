import 'server-only'
import { ATLAS_SOURCE } from '@/lib/atlas-source'
import { SERVICES, BUNDLES, buildCatalogue, type Catalogue, type PriceOverrides } from '@/lib/services'
import { getPriceOverrides } from '@/lib/server/prices-repo'
import savedPrices from '@/lib/service-prices.json'

// The services with their current prices, for server pages.
// db mode (development): prices from the database, so admin changes show on the next page load.
// static mode (production): the exported snapshot, with no database call.
// If the database can't be reached, falls back to the snapshot like the atlas does.
export async function getCatalogue(): Promise<Catalogue> {
  if (ATLAS_SOURCE === 'static') return { services: SERVICES, bundles: BUNDLES }
  try {
    return buildCatalogue({ ...(savedPrices as PriceOverrides), ...(await getPriceOverrides()) })
  } catch {
    return { services: SERVICES, bundles: BUNDLES }
  }
}
