/*
  Simulated CJ data, used while CJ_API_KEY is not set: lets the whole chain
  (import, sync, stock display, checkout check) run without the real API.
*/
import type { Product } from '../src/data/catalog.js'
import type { StockSnapshot, VariantStock } from '../src/lib/stock.js'
import type { CjProductDetail } from './cj.js'

function hash(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Deterministic stock: mostly in stock, some low, a few sold out. */
export function mockStock(vid: string): VariantStock {
  const h = hash(vid)
  const qty = h % 9 === 0 ? 0 : h % 5 === 0 ? 3 + (h % 5) : 20 + (h % 180)
  return { qty, eu: h % 3 === 0 }
}

export function mockSnapshot(products: Product[]): StockSnapshot {
  const variants: Record<string, VariantStock> = {}
  for (const p of products) for (const v of p.variants) variants[v.vid] = mockStock(v.vid)
  return { updatedAt: new Date().toISOString(), source: 'mock', variants }
}

export function mockProduct(reference: string): CjProductDetail {
  const ref = reference.replace(/^MOCK-/, '') // called with the mock pid during syncs
  const colors = ['Black', 'Wine Red']
  const sizes = ['S', 'M', 'L', 'XL']
  return {
    pid: `MOCK-${ref}`,
    productSku: ref,
    productNameEn: `Mock lace lingerie ${ref}`,
    sellPrice: 6 + (hash(ref) % 9),
    productImageSet: [],
    variants: colors.flatMap((color) =>
      sizes.map((size) => {
        return {
          vid: `MOCK-${ref}-${color}-${size}`.replace(/\s+/g, '_'),
          variantSku: `${ref}-${color}-${size}`,
          variantKey: `${color}-${size}`,
          variantSellPrice: 6 + (hash(ref) % 9),
        }
      }),
    ),
  }
}
