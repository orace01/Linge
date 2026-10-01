import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProductBySlug } from '../data/catalog'
import { formatPrice } from '../lib/format'
import { DELIVERY_ESTIMATE, shippingFee } from '../lib/shipping'

type Fields = 'email' | 'firstName' | 'lastName' | 'phone' | 'line1' | 'line2' | 'zip' | 'city'

const empty: Record<Fields, string> = { email: '', firstName: '', lastName: '', phone: '', line1: '', line2: '', zip: '', city: '' }

type StockLine = { slug: string; color: string; size: string; name: string; available: number | null; problem?: string }

function Field({
  name,
  label,
  value,
  error,
  onChange,
  ...input
}: {
  name: Fields
  label: string
  value: string
  error?: string
  onChange: (name: Fields, value: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'name'>) {
  return (
    <div>
      <label htmlFor={`field-${name}`} className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </label>
      <input
        {...input}
        id={`field-${name}`}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`input-field ${error ? '!border-error' : ''}`}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}

export function Checkout() {
  const { items, totalPrice } = useCart()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({})
  const [state, setState] = useState<{ status: 'idle' | 'sending' } | { status: 'error'; message: string; lines?: StockLine[] }>({
    status: 'idle',
  })

  if (items.length === 0) return <Navigate to="/panier" replace />

  const shipping = shippingFee(totalPrice)
  const set = (name: Fields, value: string) => {
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
    if (state.status === 'error') setState({ status: 'idle' })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setState({ status: 'sending' })
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ slug, color, size, quantity }) => ({ slug, color, size, quantity })),
          customer: { email: form.email, firstName: form.firstName, lastName: form.lastName, phone: form.phone },
          address: { line1: form.line1, line2: form.line2, zip: form.zip, city: form.city, countryCode: 'FR' },
        }),
      })
      const data = (await res.json()) as { paymentUrl?: string; error?: string; fields?: Partial<Record<Fields, string>>; lines?: StockLine[] }
      if (res.ok && data.paymentUrl) return window.location.assign(data.paymentUrl)
      if (data.error === 'invalid' && data.fields) {
        setErrors(data.fields)
        return setState({ status: 'error', message: 'Certaines informations sont à corriger.' })
      }
      if (data.error === 'stock') {
        return setState({ status: 'error', message: 'Certains articles ne sont plus disponibles :', lines: data.lines?.filter((l) => l.problem) })
      }
      if (data.error === 'closed') return setState({ status: 'error', message: 'Le paiement en ligne arrive très bientôt.' })
      setState({ status: 'error', message: 'La commande n’a pas pu être créée. Réessayez dans un instant.' })
    } catch {
      setState({ status: 'error', message: 'La commande n’a pas pu être créée. Réessayez dans un instant.' })
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-12 lg:px-10 lg:py-16">
      <Link to="/panier" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
        ← Retour au panier
      </Link>
      <h1 className="mb-10 mt-4 font-display text-4xl text-ink sm:text-5xl">Commande</h1>

      <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="space-y-10">
          <fieldset className="space-y-4">
            <legend className="mb-4 font-display text-2xl text-ink">Vos coordonnées</legend>
            <Field name="email" label="E-mail" type="email" autoComplete="email" required value={form.email} error={errors.email} onChange={set} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="firstName" label="Prénom" autoComplete="given-name" required value={form.firstName} error={errors.firstName} onChange={set} />
              <Field name="lastName" label="Nom" autoComplete="family-name" required value={form.lastName} error={errors.lastName} onChange={set} />
            </div>
            <Field name="phone" label="Téléphone (pour le livreur)" type="tel" autoComplete="tel" required value={form.phone} error={errors.phone} onChange={set} />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-4 font-display text-2xl text-ink">Adresse de livraison</legend>
            <Field name="line1" label="Adresse" autoComplete="address-line1" required value={form.line1} error={errors.line1} onChange={set} />
            <Field name="line2" label="Complément (bâtiment, étage…) — facultatif" autoComplete="address-line2" value={form.line2} error={errors.line2} onChange={set} />
            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <Field name="zip" label="Code postal" inputMode="numeric" autoComplete="postal-code" required value={form.zip} error={errors.zip} onChange={set} />
              <Field name="city" label="Ville" autoComplete="address-level2" required value={form.city} error={errors.city} onChange={set} />
            </div>
            <p className="text-sm text-ink-muted">Pays : France. Livraison suivie, en {DELIVERY_ESTIMATE}.</p>
          </fieldset>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-surface p-7">
          <h2 className="font-display text-xl text-ink">Récapitulatif</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {items.map((item) => {
              const product = getProductBySlug(item.slug)
              if (!product) return null
              return (
                <li key={`${item.slug}-${item.color}-${item.size}`} className="flex justify-between gap-4">
                  <span className="text-ink">
                    {item.quantity} × {product.name}
                    <span className="block text-xs text-ink-muted">
                      {item.color} · {item.size}
                    </span>
                  </span>
                  <span className="shrink-0 text-ink">{formatPrice(product.price * item.quantity)}</span>
                </li>
              )
            })}
          </ul>
          <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm text-ink-muted">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{shipping ? formatPrice(shipping) : 'Offerte'}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-xl text-ink">
            <span>Total</span>
            <span>{formatPrice(totalPrice + shipping)}</span>
          </div>

          <button
            type="submit"
            disabled={state.status === 'sending'}
            className="mt-6 w-full rounded-full bg-wine py-4 text-xs font-medium uppercase tracking-widest text-surface transition hover:bg-wine-hover disabled:opacity-60"
          >
            {state.status === 'sending' ? 'Vérification…' : 'Payer ma commande'}
          </button>
          <div aria-live="polite" className="mt-4 text-xs leading-relaxed text-error">
            {state.status === 'error' && (
              <>
                <p>{state.message}</p>
                {state.lines && (
                  <ul className="mt-1 space-y-1">
                    {state.lines.map((l) => (
                      <li key={`${l.slug}-${l.color}-${l.size}`}>
                        {l.name} ({l.color}, {l.size})
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </aside>
      </form>
    </div>
  )
}
