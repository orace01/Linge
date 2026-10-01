/*
  Payment providers. Plugging in the real aggregator = adding one file that
  implements PaymentProvider and returning it below for the 'live' mode.
*/
import { orderMode } from '../order-mode.js'
import type { Order } from '../orders.js'
import { mockProvider } from './mock.js'

export type PaymentNotice = { orderId: string; paid: boolean; reference?: string }

export type PaymentProvider = {
  name: string
  /** Starts a payment and returns the page the customer must be sent to. */
  createPayment(order: Order, origin: string): Promise<{ url: string; reference?: string }>
  /**
   * Reads the provider's server-to-server notification (POST /api/payments/webhook).
   * Must verify that it really comes from the provider (signature) and return
   * null when it does not.
   */
  parseWebhook(request: Request): Promise<PaymentNotice | null>
}

export function getPaymentProvider(): PaymentProvider | null {
  const mode = orderMode()
  if (mode === 'test') return mockProvider
  // if (mode === 'live') return theAggregatorProvider
  return null
}
