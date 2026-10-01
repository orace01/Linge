import { checkCart, parseCart } from '../server/checkout.js'
import { parseCustomer } from '../server/checkout-input.js'
import { refreshTracking } from '../server/fulfil.js'
import { json } from '../server/http.js'
import { orderMode } from '../server/order-mode.js'
import { loadOrder, newOrderId, newOrderNumber, publicOrder, saveOrder, type Order } from '../server/orders.js'
import { getPaymentProvider } from '../server/payments/index.js'
import { round2, shippingFee } from '../src/lib/shipping.js'

/** GET ?id=… -> the customer's view of an order (status, tracking). */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') ?? ''
  const order = await loadOrder(id)
  if (!order) return json({ error: 'Commande introuvable' }, { status: 404 })
  await refreshTracking(order)
  return json(publicOrder(order))
}

/** POST { items, customer, address } -> creates the order and returns where to pay. */
export async function POST(request: Request) {
  const mode = orderMode()
  const provider = getPaymentProvider()
  if (mode === 'off' || !provider) return json({ error: 'closed' }, { status: 503 })

  const body = await request.json().catch(() => null)
  const lines = parseCart(body)
  if (!lines) return json({ error: 'Panier invalide' }, { status: 400 })
  const who = parseCustomer(body)
  if ('errors' in who) return json({ error: 'invalid', fields: who.errors }, { status: 400 })

  try {
    // prices and stock come from the server, never from the browser
    const check = await checkCart(lines)
    if (!check.ok) return json({ error: 'stock', lines: check.lines }, { status: 409 })

    const shipping = shippingFee(check.subtotal)
    const now = new Date().toISOString()
    const order: Order = {
      id: newOrderId(),
      number: newOrderNumber(),
      createdAt: now,
      updatedAt: now,
      status: 'pending_payment',
      mode,
      customer: who.customer,
      address: who.address,
      lines: check.lines.map(({ slug, name, color, size, quantity, unitPrice, vid }) => ({ slug, name, color, size, quantity, unitPrice, vid })),
      subtotal: check.subtotal,
      shipping,
      total: round2(check.subtotal + shipping),
      payment: { provider: provider.name },
    }
    const payment = await provider.createPayment(order, new URL(request.url).origin)
    order.payment.reference = payment.reference
    await saveOrder(order)
    return json({ id: order.id, number: order.number, paymentUrl: payment.url })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 })
  }
}
