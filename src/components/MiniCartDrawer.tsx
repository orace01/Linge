import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProductBySlug } from '../data/catalog'
import { EmptyFrame } from './EmptyFrame'
import { CloseIcon } from './icons'

export function MiniCartDrawer() {
  const { items, isMiniCartOpen, closeMiniCart, removeItem, totalPrice } = useCart()

  return (
    <div className={`fixed inset-0 z-[60] ${isMiniCartOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div
        onClick={closeMiniCart}
        className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${isMiniCartOpen ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-page transition-transform duration-300 ${
          isMiniCartOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <p className="font-display text-lg tracking-wide text-ink">Votre panier</p>
          <button onClick={closeMiniCart} aria-label="Fermer le panier">
            <CloseIcon className="h-5 w-5 text-ink" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink-muted">Votre panier est vide pour le moment.</p>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => {
                const product = getProductBySlug(item.slug)
                if (!product) return null
                return (
                  <li key={`${item.slug}-${item.color}-${item.size}`} className="flex gap-4">
                    <EmptyFrame ratio="3 / 4" className="w-20 shrink-0" label={null} />
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-base text-ink">{product.name}</p>
                          <p className="text-[11px] uppercase tracking-wide text-ink-muted">
                            {item.color} · {item.size}
                          </p>
                        </div>
                        <button onClick={() => removeItem(item.slug, item.color, item.size)} aria-label="Retirer">
                          <CloseIcon className="h-3.5 w-3.5 text-ink-muted" />
                        </button>
                      </div>
                      <p className="text-sm text-ink">
                        {item.quantity} × {product.price}&nbsp;€
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="flex items-center justify-between text-sm text-ink">
              <span>Sous-total</span>
              <span className="font-display text-lg">{totalPrice}&nbsp;€</span>
            </div>
            <Link
              to="/panier"
              onClick={closeMiniCart}
              className="mt-4 block rounded-full border border-wine px-6 py-3 text-center text-xs uppercase tracking-widest text-wine transition hover:bg-wine hover:text-surface"
            >
              Voir le panier
            </Link>
            <Link
              to="/panier"
              onClick={closeMiniCart}
              className="mt-3 block rounded-full bg-wine px-6 py-3 text-center text-xs uppercase tracking-widest text-surface transition hover:bg-wine-hover"
            >
              Commander
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
