import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import type { OrderStatus as Status, PublicOrder } from '../lib/order-types'
import { DELIVERY_ESTIMATE } from '../lib/shipping'

const steps: { key: Status[]; label: string }[] = [
  { key: ['paid', 'cj_error'], label: 'Paiement reçu' },
  { key: ['sent_to_cj'], label: 'En préparation' },
  { key: ['shipped'], label: 'Expédiée' },
  { key: ['delivered'], label: 'Livrée' },
]

const headline: Record<Status, string> = {
  pending_payment: 'En attente de paiement',
  paid: 'Merci, votre commande est confirmée',
  cj_error: 'Merci, votre commande est confirmée',
  sent_to_cj: 'Votre commande est en préparation',
  shipped: 'Votre commande est en route',
  delivered: 'Votre commande a été livrée',
  cancelled: 'Cette commande a été annulée',
}

export function OrderStatus() {
  const { id } = useParams<{ id: string }>()
  const { clearCart } = useCart()
  const [order, setOrder] = useState<PublicOrder | null | 'missing'>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/orders?id=${encodeURIComponent(id ?? '')}`)
      .then((res) => (res.ok ? (res.json() as Promise<PublicOrder>) : null))
      .then((data) => {
        if (cancelled) return
        setOrder(data ?? 'missing')
        // the cart has become this order
        if (data && data.status !== 'pending_payment') clearCart()
      })
      .catch(() => !cancelled && setOrder('missing'))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (order === null) return <p className="px-5 py-24 text-center text-sm text-ink-muted">Chargement de votre commande…</p>
  if (order === 'missing') {
    return (
      <div className="px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-ink">Commande introuvable</h1>
        <p className="mt-4 text-sm text-ink-muted">Vérifiez le lien reçu par e-mail.</p>
        <Link to="/boutique" className="mt-8 inline-block rounded-full bg-wine px-8 py-3.5 text-xs uppercase tracking-widest text-surface">
          Voir la boutique
        </Link>
      </div>
    )
  }

  const reached = steps.findIndex((s) => s.key.includes(order.status))

  return (
    <div className="mx-auto max-w-[760px] px-5 py-12 lg:py-16">
      {order.test && (
        <p className="mb-6 rounded-xl bg-rose-soft px-4 py-3 text-xs text-wine">
          Commande de test : aucun paiement réel, aucun colis expédié.
        </p>
      )}
      <p className="text-[11px] uppercase tracking-[0.16em] text-wine">Commande {order.number}</p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">{headline[order.status]}</h1>
      <p className="mt-4 text-sm text-ink-muted">
        {order.status === 'pending_payment'
          ? 'Le paiement de cette commande n’a pas encore été reçu.'
          : `${order.firstName}, nous préparons votre colis pour ${order.city}. Livraison en ${DELIVERY_ESTIMATE}.`}
      </p>

      {order.status !== 'pending_payment' && order.status !== 'cancelled' && (
        <ol className="mt-10 grid grid-cols-4 gap-2">
          {steps.map((step, i) => (
            <li key={step.label} aria-current={i === reached ? 'step' : undefined}>
              <span className={`block h-1 rounded-full ${i <= reached ? 'bg-wine' : 'bg-border'}`} />
              <span className={`mt-2 block text-[11px] uppercase tracking-wide ${i <= reached ? 'text-ink' : 'text-ink-muted'}`}>
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      )}

      {order.tracking && (
        <p className="mt-8 rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-ink">
          Numéro de suivi : <strong className="font-medium">{order.tracking.number}</strong>
          {order.tracking.url && (
            <>
              {' · '}
              <a href={order.tracking.url} target="_blank" rel="noreferrer" className="text-wine underline">
                Suivre le colis
              </a>
            </>
          )}
        </p>
      )}

      <div className="mt-10 rounded-3xl border border-border bg-surface p-7">
        <ul className="space-y-3 text-sm">
          {order.lines.map((l) => (
            <li key={`${l.slug}-${l.color}-${l.size}`} className="flex justify-between gap-4">
              <span className="text-ink">
                {l.quantity} × {l.name}
                <span className="block text-xs text-ink-muted">
                  {l.color} · {l.size}
                </span>
              </span>
              <span className="shrink-0 text-ink">{formatPrice(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm text-ink-muted">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Livraison</span>
            <span>{order.shipping ? formatPrice(order.shipping) : 'Offerte'}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-xl text-ink">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <p className="mt-6 text-xs text-ink-muted">Conservez ce lien : il permet de suivre votre commande à tout moment.</p>
    </div>
  )
}
