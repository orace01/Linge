import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getProductBySlug } from '../data/catalog'

export type CartItem = {
  slug: string
  color: string
  size: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (slug: string, color: string, size: string) => void
  updateQuantity: (slug: string, color: string, size: string, quantity: number) => void
  totalItems: number
  totalPrice: number
  isMiniCartOpen: boolean
  openMiniCart: () => void
  closeMiniCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)
const STORAGE_KEY = 'marque-cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore storage errors
    }
  }, [items])

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug && i.color === item.color && i.size === item.size)
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, quantity: i.quantity + item.quantity } : i))
      }
      return [...prev, item]
    })
    setIsMiniCartOpen(true)
  }

  const removeItem = (slug: string, color: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.color === color && i.size === size)))
  }

  const updateQuantity = (slug: string, color: string, size: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.slug === slug && i.color === color && i.size === size ? { ...i, quantity: Math.max(1, quantity) } : i,
      ),
    )
  }

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const totalPrice = useMemo(
    () =>
      items.reduce((sum, i) => {
        const product = getProductBySlug(i.slug)
        return product ? sum + product.price * i.quantity : sum
      }, 0),
    [items],
  )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        totalItems,
        totalPrice,
        isMiniCartOpen,
        openMiniCart: () => setIsMiniCartOpen(true),
        closeMiniCart: () => setIsMiniCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
