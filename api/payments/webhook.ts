import { markPaid } from '../../server/fulfil.js'
import { json } from '../../server/http.js'
import { loadOrder, publicOrder } from '../../server/orders.js'
import { getPaymentProvider } from '../../server/payments/index.js'

/** The payment provider calls this when a payment succeeds: the order is then sent to CJ. */
export async function POST(request: Request) {
  const provider = getPaymentProvider()
  if (!provider) return json({ error: 'closed' }, { status: 503 })
  const notice = await provider.parseWebhook(request)
  if (!notice) return json({ error: 'Notification invalide' }, { status: 400 })
  const order = await loadOrder(notice.orderId)
  if (!order) return json({ error: 'Commande introuvable' }, { status: 404 })
  if (!notice.paid) return json(publicOrder(order))
  return json(publicOrder(await markPaid(order, notice.reference, new URL(request.url).origin)))
}
