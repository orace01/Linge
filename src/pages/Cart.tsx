import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { colorwayOf, getProductBySlug } from '../data/catalog'
import { FabricMedia } from '../components/FabricMedia'
import { formatPrice } from '../lib/format'
import { FREE_SHIPPING_FROM, shippingFee } from '../lib/shipping'

type CheckedLine = {
  slug: string
  color: string
  size: string
  name: string
  available: number | null
  problem?: 'unknown-product' | 'unknown-variant' | 'out-of-stock' | 'not-enough'
}
type Check = { cart: string } & (
  | { status: 'idle' | 'loading' | 'error' }
  | { status: 'ok' | 'issues'; lines: CheckedLine[] }
)

function problemText(line: CheckedLine) {
  if (line.problem === 'out-of-stock') return 'épuisé'
  if (line.problem === 'not-enough') return `plus que ${line.available} disponible${(line.available ?? 0) > 1 ? 's' : ''}`
  return 'n’est plus proposé'
}

export function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()
  const navigate = useNavigate()
  const shipping = shippingFee(totalPrice)
  const cart = JSON.stringify(items)
  const [lastCheck, setCheck] = useState<Check>({ cart, status: 'idle' })
  // a check only applies to the cart it was made for
  const check: Check = lastCheck.cart === cart ? lastCheck : { cart, status: 'idle' }

  // stock and prices are checked by the server right before payment
  const handleCheckout = async () => {
    setCheck({ cart, status: 'loading' })
    try {
      const res = await fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(({ slug, color, size, quantity }) => ({ slug, color, size, quantity })) }),
      })
      const data = (await res.json()) as { ok?: boolean; lines?: CheckedLine[]; checkout?: string }
      if (!res.ok || !data.lines) throw new Error()
      // ordering is open (test or live): on to the delivery details
      if (data.ok && data.checkout && data.checkout !== 'off') return navigate('/commande')
      setCheck({ cart, status: data.ok ? 'ok' : 'issues', lines: data.lines })
    } catch {
      setCheck({ cart, status: 'error' })
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:px-10 lg:py-16">
      <h1 className="mb-10 font-display text-4xl text-ink">Votre panier</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-ink-muted">Votre panier est vide pour le moment.</p>
          <Link
            to="/boutique"
            className="mt-6 inline-block rounded-full bg-wine px-8 py-3.5 text-xs uppercase tracking-widest text-surface transition hover:bg-wine-hover"
          >
            Voir la boutique
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <div className="lg:w-[880px]">
            {items.map((item) => {
              const product = getProductBySlug(item.slug)
              if (!product) return null
              return (
                <div key={`${item.slug}-${item.color}-${item.size}`} className="mb-7 flex gap-6 border-b border-border pb-7">
                  {product.image ? (
                    <img src={product.image} alt="" className="aspect-[3/4] w-24 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <FabricMedia colorway={colorwayOf(item.color)} motion="still" className="aspect-[3/4] w-24 shrink-0 rounded-xl" />
                  )}
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg text-ink">{product.name}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-muted">
                          {item.color} — Taille {item.size}
                        </p>
                      </div>
                      <p className="text-[15px] text-ink">{formatPrice(product.price)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          onClick={() => updateQuantity(item.slug, item.color, item.size, item.quantity - 1)}
                          className="px-3.5 py-1.5 text-ink-muted"
                          aria-label="Diminuer la quantité"
                        >
                          −
                        </button>
                        <span className="px-1.5 text-sm text-ink">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.slug, item.color, item.size, item.quantity + 1)}
                          className="px-3.5 py-1.5 text-ink-muted"
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug, item.color, item.size)}
                        className="text-[11px] uppercase tracking-wide text-ink-muted hover:text-wine"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            <Link to="/boutique" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
              Continuer mes achats
            </Link>
          </div>

          <div className="h-fit rounded-3xl border border-border bg-surface p-8 lg:w-[340px] lg:flex-shrink-0">
            <p className="font-display text-lg text-ink">Récapitulatif</p>
            <div className="mt-5 flex justify-between text-sm text-ink-muted">
              <span>Sous-total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="mt-2.5 flex justify-between text-sm text-ink-muted">
              <span>Livraison</span>
              <span>{shipping ? formatPrice(shipping) : 'Offerte'}</span>
            </div>
            {shipping > 0 && (
              <p className="mt-2 text-xs text-ink-muted">
                Plus que {formatPrice(FREE_SHIPPING_FROM - totalPrice)} pour la livraison offerte.
              </p>
            )}
            <div className="mt-5 flex justify-between border-t border-border pt-5 font-display text-xl text-ink">
              <span>Total</span>
              <span>{formatPrice(totalPrice + shipping)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={check.status === 'loading'}
              className="mt-6 w-full rounded-full bg-wine py-4 text-xs font-medium uppercase tracking-widest text-surface transition hover:bg-wine-hover disabled:opacity-60"
            >
              {check.status === 'loading' ? 'Vérification du stock…' : 'Passer commande'}
            </button>
            <div aria-live="polite" className="mt-4 text-xs leading-relaxed">
              {check.status === 'ok' && (
                <p className="text-success">Tout est disponible. Le paiement en ligne arrive très bientôt.</p>
              )}
              {check.status === 'issues' && (
                <div className="text-error">
                  <ul className="space-y-1">
                    {check.lines
                      .filter((l) => l.problem)
                      .map((l) => (
                        <li key={`${l.slug}-${l.color}-${l.size}`}>
                          {l.name} ({l.color}, {l.size}) : {problemText(l)}
                        </li>
                      ))}
                  </ul>
                  <p className="mt-2 text-ink-muted">Ajustez votre panier puis réessayez.</p>
                </div>
              )}
              {check.status === 'error' && (
                <p className="text-error">Impossible de vérifier le stock pour le moment. Réessayez dans un instant.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
