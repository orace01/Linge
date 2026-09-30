/*
  Stock sync: one CJ call per variant (CJ has no per-product stock), written
  to the snapshot the site reads. Runs in GitHub Actions (`npm run cj:sync`):
  ~200 variants take ~4 minutes, longer than a free Vercel function may run.
  A variant that fails keeps its previous value, so one CJ hiccup never
  empties the shop.
*/
import { products, usesDemoCatalog } from '../src/data/catalog.js'
import type { StockSnapshot, VariantStock } from '../src/lib/stock.js'
import { getVariantStock } from './cj.js'
import { mockSnapshot } from './mock.js'
import { readSnapshot, writeSnapshot } from './stock-store.js'

export type SyncReport = {
  source: StockSnapshot['source']
  products: number
  variants: number
  errors: { product: string; vid: string; message: string }[]
  durationMs: number
}

export async function syncStock(log: (message: string) => void = () => {}): Promise<SyncReport> {
  const started = Date.now()

  if (usesDemoCatalog) {
    const snapshot = mockSnapshot(products)
    await writeSnapshot(snapshot)
    return { source: 'mock', products: products.length, variants: Object.keys(snapshot.variants).length, errors: [], durationMs: Date.now() - started }
  }

  const previous = (await readSnapshot())?.variants ?? {}
  const variants: Record<string, VariantStock> = {}
  const errors: SyncReport['errors'] = []
  const all = products.flatMap((p) => p.variants.map((v) => ({ product: p.slug, vid: v.vid, label: `${p.name} ${v.color} ${v.size}` })))

  for (const [i, { product, vid, label }] of all.entries()) {
    try {
      variants[vid] = await getVariantStock(vid)
      log(`[${i + 1}/${all.length}] ${label} : ${variants[vid].qty}${variants[vid].eu ? ' (UE)' : ''}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push({ product, vid, message })
      log(`[${i + 1}/${all.length}] ${label} : ERREUR ${message}`)
      if (previous[vid]) variants[vid] = previous[vid]
    }
  }

  if (all.length > 0 && errors.length === all.length) {
    throw new Error(`Aucune variante n'a pu être lue chez CJ (${errors[0].message}) : stock précédent conservé`)
  }

  await writeSnapshot({ updatedAt: new Date().toISOString(), source: 'cj', variants })
  return { source: 'cj', products: products.length, variants: Object.keys(variants).length, errors, durationMs: Date.now() - started }
}
