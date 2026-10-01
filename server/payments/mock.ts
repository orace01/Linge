/*
  Simulated payment, only reachable in ORDER_MODE=test: the customer lands on
  /paiement-test, which "pays" by calling the webhook itself. No money moves.
*/
import type { PaymentProvider } from './index.js'

export const mockProvider: PaymentProvider = {
  name: 'test',
  async createPayment(order) {
    return { url: `/paiement-test?commande=${order.id}`, reference: `TEST-${order.number}` }
  },
  async parseWebhook(request) {
    const body = (await request.json().catch(() => null)) as { orderId?: unknown; outcome?: unknown } | null
    if (typeof body?.orderId !== 'string') return null
    return { orderId: body.orderId, paid: body.outcome === 'paid' }
  },
}
