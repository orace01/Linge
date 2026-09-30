/*
  Stock rules shared by the site and the server functions.
  A snapshot maps each variant id (CJ `vid`) to its quantity and whether some
  of it sits in a European warehouse (faster delivery).
*/

export type VariantStock = {
  qty: number
  /** stock available in a European warehouse */
  eu: boolean
}

export type StockSnapshot = {
  updatedAt: string | null
  source: 'cj' | 'mock' | 'none'
  variants: Record<string, VariantStock>
}

export type StockLevel = 'in' | 'low' | 'out'

/** units kept back so we never sell what may have gone between two syncs */
export const STOCK_BUFFER = 2
/** "Plus que N" is shown at or under this quantity */
export const LOW_STOCK = 5

export const EU_WAREHOUSES = new Set(['FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'PL', 'CZ', 'PT', 'AT', 'SE', 'DK', 'IE'])

export function availableQty(stock: VariantStock | undefined): number | null {
  return stock ? Math.max(0, stock.qty - STOCK_BUFFER) : null
}

export function stockLevel(stock: VariantStock | undefined): StockLevel | null {
  const qty = availableQty(stock)
  if (qty === null) return null
  if (qty <= 0) return 'out'
  return qty <= LOW_STOCK ? 'low' : 'in'
}

export function deliveryEstimate(stock: VariantStock | undefined): string {
  return stock?.eu ? '3 à 8 jours ouvrés' : '10 à 20 jours ouvrés'
}
