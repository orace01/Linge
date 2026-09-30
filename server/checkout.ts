/*
  Checks a cart right before payment: prices come from the catalogue (never
  from the browser) and each variant's stock is re-read live from CJ (one call
  per cart line), falling back on the last sync if CJ does not answer.
*/
import { findVariant, getProductBySlug, products, usesDemoCatalog } from '../src/data/catalog.js'
import { availableQty, type VariantStock } from '../src/lib/stock.js'
import { cjEnabled, getVariantStock } from './cj.js'
import { mockSnapshot } from './mock.js'
import { readSnapshot } from './stock-store.js'

export type CartLine = { slug: string; color: string; size: string; quantity: number }

export type CheckedLine = CartLine & {
  name: string
  vid: string
  unitPrice: number
  available: number | null
  problem?: 'unknown-product' | 'unknown-variant' | 'out-of-stock' | 'not-enough'
}

export type CheckoutCheck = { ok: boolean; lines: CheckedLine[]; subtotal: number }

const MAX_LINES = 20 // ~1 s per line at CJ's 1 request / second

export function parseCart(body: unknown): CartLine[] | null {
  const items = (body as { items?: unknown })?.items
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LINES) return null
  const lines: CartLine[] = []
  for (const item of items) {
    const { slug, color, size, quantity } = item as Record<string, unknown>
    if (typeof slug !== 'string' || typeof color !== 'string' || typeof size !== 'string') return null
    if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > 10) return null
    lines.push({ slug, color, size, quantity: quantity as number })
  }
  return lines
}

async function liveStock(vids: string[]): Promise<Record<string, VariantStock>> {
  if (usesDemoCatalog) return mockSnapshot(products).variants
  const stock = { ...(await readSnapshot())?.variants }
  if (!cjEnabled()) return stock
  for (const vid of vids) {
    try {
      stock[vid] = await getVariantStock(vid)
    } catch {
      // CJ busy or down: keep the value of the last sync
    }
  }
  return stock
}

export async function checkCart(lines: CartLine[]): Promise<CheckoutCheck> {
  const vids = lines.flatMap((l) => {
    const product = getProductBySlug(l.slug)
    const variant = product && findVariant(product, l.color, l.size)
    return variant ? [variant.vid] : []
  })
  const stock = await liveStock([...new Set(vids)])

  const checked = lines.map((line): CheckedLine => {
    const product = getProductBySlug(line.slug)
    if (!product) return { ...line, name: line.slug, vid: '', unitPrice: 0, available: null, problem: 'unknown-product' }
    const variant = findVariant(product, line.color, line.size)
    if (!variant) return { ...line, name: product.name, vid: '', unitPrice: product.price, available: null, problem: 'unknown-variant' }
    const available = availableQty(stock[variant.vid])
    const problem = available === null ? undefined : available <= 0 ? 'out-of-stock' : available < line.quantity ? 'not-enough' : undefined
    return { ...line, name: product.name, vid: variant.vid, unitPrice: product.price, available, problem }
  })

  const subtotal = checked.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  return { ok: checked.every((l) => !l.problem), lines: checked, subtotal: Math.round(subtotal * 100) / 100 }
}
