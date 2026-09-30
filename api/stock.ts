import { products, usesDemoCatalog } from '../src/data/catalog.js'
import type { StockSnapshot } from '../src/lib/stock.js'
import { json } from '../server/http.js'
import { mockSnapshot } from '../server/mock.js'
import { readSnapshot } from '../server/stock-store.js'

/** Latest stock snapshot for the shop; cached 5 min at the edge. */
export async function GET() {
  const stored = await readSnapshot()
  const snapshot: StockSnapshot =
    stored ?? (usesDemoCatalog ? mockSnapshot(products) : { updatedAt: null, source: 'none', variants: {} })
  return json(snapshot, { cache: 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600' })
}
