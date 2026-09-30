import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Product } from '../data/catalog'
import { stockLevel, type StockLevel, type StockSnapshot, type VariantStock } from '../lib/stock'

type StockContextValue = {
  /** null while loading or when the stock service is unreachable (nothing is blocked then) */
  snapshot: StockSnapshot | null
  variant: (vid: string | undefined) => VariantStock | undefined
  level: (vid: string | undefined) => StockLevel | null
  /** best level over the product's variants: 'out' only when every variant is sold out */
  productLevel: (product: Product) => StockLevel | null
}

const StockContext = createContext<StockContextValue | null>(null)

export function StockProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<StockSnapshot | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/stock')
      .then((res) => (res.ok ? (res.json() as Promise<StockSnapshot>) : null))
      .then((data) => {
        if (!cancelled && data?.variants) setSnapshot(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const variant = (vid: string | undefined) => (vid && snapshot ? snapshot.variants[vid] : undefined)
  const level = (vid: string | undefined) => stockLevel(variant(vid))
  const productLevel = (product: Product): StockLevel | null => {
    const levels = product.variants.map((v) => level(v.vid)).filter((l): l is StockLevel => l !== null)
    if (!levels.length) return null
    if (levels.includes('in')) return 'in'
    return levels.includes('low') ? 'low' : 'out'
  }

  return <StockContext.Provider value={{ snapshot, variant, level, productLevel }}>{children}</StockContext.Provider>
}

export function useStock() {
  const ctx = useContext(StockContext)
  if (!ctx) throw new Error('useStock must be used inside StockProvider')
  return ctx
}
