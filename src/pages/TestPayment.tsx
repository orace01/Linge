import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { formatPrice } from '../lib/format'
import type { PublicOrder } from '../lib/order-types'

/** Stands in for the payment provider's page while ORDER_MODE=test. */
export function TestPayment() {
  const [params] = useSearchParams()
  const id = params.get('commande') ?? ''
  const navigate = useNavigate()
  const [order, setOrder] = useState<PublicOrder | null | 'missing'>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/orders?id=${encodeURIComponent(id)}`)
      .then((res) => (res.ok ? (res.json() as Promise<PublicOrder>) : null))
      .then((data) => !cancelled && setOrder(data ?? 'missing'))
      .catch(() => !cancelled && setOrder('missing'))
    return () => {
      cancelled = true
    }
  }, [id])

  const pay = async (outcome: 'paid' | 'failed') => {
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, outcome }),
      })
      if (!res.ok) throw new Error()
      if (outcome === 'paid') return navigate(`/commande/${id}`)
      setMessage('Paiement refusé (simulation). La commande reste en attente : vous pouvez réessayer.')
    } catch {
      setMessage('La simulation a échoué. Réessayez.')
    }
    setBusy(false)
  }

  if (order === null) return <p className="px-5 py-24 text-center text-sm text-ink-muted">Chargement…</p>
  if (order === 'missing') return <p className="px-5 py-24 text-center text-sm text-ink-muted">Commande introuvable.</p>

  return (
    <div className="mx-auto max-w-[520px] px-5 py-16 text-center">
      <p className="rounded-xl bg-rose-soft px-4 py-3 text-xs text-wine">
        Mode test : cette page remplace l'agrégateur de paiement. Aucun paiement réel n'est effectué.
      </p>
      <p className="mt-10 text-[11px] uppercase tracking-[0.16em] text-wine">Commande {order.number}</p>
      <h1 className="mt-3 font-display text-4xl text-ink">Paiement simulé</h1>
      <p className="mt-4 font-display text-3xl text-ink">{formatPrice(order.total)}</p>

      {order.status === 'pending_payment' ? (
        <div className="mt-8 space-y-3">
          <button
            onClick={() => pay('paid')}
            disabled={busy}
            className="w-full rounded-full bg-wine py-4 text-xs font-medium uppercase tracking-widest text-surface transition hover:bg-wine-hover disabled:opacity-60"
          >
            {busy ? 'Traitement…' : 'Simuler un paiement réussi'}
          </button>
          <button
            onClick={() => pay('failed')}
            disabled={busy}
            className="w-full rounded-full border border-wine py-4 text-xs font-medium uppercase tracking-widest text-wine transition hover:bg-wine hover:text-surface disabled:opacity-60"
          >
            Simuler un paiement refusé
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate(`/commande/${id}`)}
          className="mt-8 w-full rounded-full bg-wine py-4 text-xs font-medium uppercase tracking-widest text-surface"
        >
          Cette commande est déjà payée : voir son suivi
        </button>
      )}
      <p aria-live="polite" className="mt-4 text-xs text-error">
        {message}
      </p>
    </div>
  )
}
