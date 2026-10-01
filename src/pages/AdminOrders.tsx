import { useState, type FormEvent } from 'react'
import { formatPrice } from '../lib/format'
import type { AdminOrder, OrderStatus } from '../lib/order-types'

const statusLabel: Record<OrderStatus, string> = {
  pending_payment: 'En attente de paiement',
  paid: 'Payée',
  cj_error: 'À traiter : refusée par CJ',
  sent_to_cj: 'Chez CJ, en préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const KEY = 'lucea-admin'

/** The merchant's list of orders, behind ADMIN_SECRET. */
export function AdminOrders() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem(KEY) ?? '')
  const [orders, setOrders] = useState<AdminOrder[] | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const call = async (init?: RequestInit) => {
    const res = await fetch('/api/admin/orders', { ...init, headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' } })
    if (res.status === 401) throw new Error('Mot de passe incorrect.')
    if (!res.ok) throw new Error('Erreur du serveur.')
    return res.json()
  }

  const load = async (event?: FormEvent) => {
    event?.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const data = (await call()) as { orders: AdminOrder[] }
      sessionStorage.setItem(KEY, secret)
      setOrders(data.orders)
    } catch (error) {
      setOrders(null)
      setMessage(error instanceof Error ? error.message : 'Erreur')
    }
    setBusy(false)
  }

  const retry = async (id: string) => {
    setBusy(true)
    try {
      await call({ method: 'POST', body: JSON.stringify({ id, action: 'retry-cj' }) })
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erreur')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 lg:px-10">
      <h1 className="font-display text-4xl text-ink">Commandes</h1>

      {orders === null ? (
        <form onSubmit={load} className="mt-8 flex max-w-md gap-3">
          <label className="flex-1">
            <span className="sr-only">Mot de passe administrateur</span>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Mot de passe administrateur"
              autoComplete="current-password"
              className="input-field"
            />
          </label>
          <button disabled={busy} className="rounded-full bg-wine px-6 text-xs uppercase tracking-widest text-surface disabled:opacity-60">
            Ouvrir
          </button>
        </form>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              {orders.length} commande{orders.length > 1 ? 's' : ''}
            </p>
            <button onClick={() => load()} disabled={busy} className="text-xs uppercase tracking-widest text-wine underline disabled:opacity-60">
              Actualiser
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="py-3 pr-4 font-normal">Commande</th>
                  <th className="py-3 pr-4 font-normal">Cliente</th>
                  <th className="py-3 pr-4 font-normal">Articles</th>
                  <th className="py-3 pr-4 font-normal">Total</th>
                  <th className="py-3 pr-4 font-normal">État</th>
                  <th className="py-3 font-normal">CJ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border align-top">
                    <td className="py-3 pr-4">
                      <a href={`/commande/${o.id}`} className="text-wine underline">
                        {o.number}
                      </a>
                      <span className="block text-xs text-ink-muted">{new Date(o.createdAt).toLocaleString('fr-FR')}</span>
                      {o.test && <span className="text-xs text-ink-muted">test</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {o.customer.firstName} {o.customer.lastName}
                      <span className="block text-xs text-ink-muted">
                        {o.customer.email} · {o.customer.phone}
                      </span>
                      <span className="block text-xs text-ink-muted">
                        {o.address.line1}
                        {o.address.line2 && `, ${o.address.line2}`}, {o.address.zip} {o.address.city}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {o.lines.map((l) => (
                        <span key={`${l.slug}-${l.color}-${l.size}`} className="block">
                          {l.quantity} × {l.name} <span className="text-xs text-ink-muted">({l.color}, {l.size})</span>
                        </span>
                      ))}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">{formatPrice(o.total)}</td>
                    <td className={`py-3 pr-4 ${o.status === 'cj_error' ? 'text-error' : 'text-ink'}`}>
                      {statusLabel[o.status]}
                      {o.tracking && <span className="block text-xs text-ink-muted">Suivi : {o.tracking.number}</span>}
                    </td>
                    <td className="py-3 text-xs text-ink-muted">
                      {o.cj?.simulated && 'simulée (pas d’appel CJ)'}
                      {o.cj?.orderId && (
                        <>
                          {o.cj.orderId}
                          {o.cj.sandbox && ' (sandbox)'}
                          {o.cj.status && <span className="block">{o.cj.status}</span>}
                          {o.cj.amountUsd !== undefined && <span className="block">coût : {o.cj.amountUsd} $</span>}
                        </>
                      )}
                      {o.cj?.error && <span className="block text-error">{o.cj.error}</span>}
                      {o.status === 'cj_error' && (
                        <button onClick={() => retry(o.id)} disabled={busy} className="mt-1 text-wine underline disabled:opacity-60">
                          Renvoyer à CJ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p aria-live="polite" className="mt-4 text-sm text-error">
        {message}
      </p>
    </div>
  )
}
