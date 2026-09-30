import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProductBySlug } from '../data/catalog'
import { EmptyFrame } from '../components/EmptyFrame'

export function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:px-10 lg:py-16">
      <h1 className="mb-10 font-display text-4xl text-plum">Votre panier</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm plum-soft">Votre panier est vide pour le moment.</p>
          <Link
            to="/boutique"
            className="mt-6 inline-block rounded-full bg-raspberry px-8 py-3.5 text-xs uppercase tracking-widest text-white"
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
                <div key={`${item.slug}-${item.color}-${item.size}`} className="mb-7 flex gap-6 border-b border-plum/10 pb-7">
                  <EmptyFrame ratio="3 / 4" tone="light" className="w-24 shrink-0" label={null} />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg text-plum">{product.name}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide plum-soft">
                          {item.color} — Taille {item.size}
                        </p>
                      </div>
                      <p className="text-[15px] text-plum">{product.price}&nbsp;€</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-plum/20">
                        <button
                          onClick={() => updateQuantity(item.slug, item.color, item.size, item.quantity - 1)}
                          className="px-3.5 py-1.5 plum-soft"
                          aria-label="Diminuer la quantité"
                        >
                          −
                        </button>
                        <span className="px-1.5 text-sm text-plum">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.slug, item.color, item.size, item.quantity + 1)}
                          className="px-3.5 py-1.5 plum-soft"
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug, item.color, item.size)}
                        className="text-[11px] uppercase tracking-wide plum-soft hover:text-raspberry"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            <Link to="/boutique" className="text-xs uppercase tracking-widest plum-soft hover:text-plum">
              Continuer mes achats
            </Link>
          </div>

          <div className="h-fit rounded-3xl bg-plum p-8 lg:w-[340px] lg:flex-shrink-0">
            <p className="font-display text-lg text-ivory">Récapitulatif</p>
            <div className="mt-5 flex justify-between text-sm text-ivory/72">
              <span>Sous-total</span>
              <span>{totalPrice}&nbsp;€</span>
            </div>
            <div className="mt-2.5 flex justify-between text-sm text-ivory/72">
              <span>Livraison</span>
              <span>{totalPrice >= 80 ? 'Offerte' : 'Calculée à l’étape suivante'}</span>
            </div>
            <div className="mt-5 flex justify-between border-t border-ivory/18 pt-5 font-display text-xl text-ivory">
              <span>Total</span>
              <span>{totalPrice}&nbsp;€</span>
            </div>
            <button className="mt-6 w-full rounded-full bg-raspberry py-4 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-raspberry-deep">
              Passer commande
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
