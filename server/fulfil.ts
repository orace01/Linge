/*
  What happens once an order is paid: it is handed to CJ, who prepares and
  ships it. Safe to call twice (payment notifications can be repeated).

  - test mode: no CJ call, unless CJ_TEST_ORDERS=1 - then a CJ *sandbox* order
    is created (nothing charged, nothing shipped).
  - live mode: a real CJ order, paid from the CJ balance.
*/
import { SHIPPING } from '../src/lib/shipping.js'
import { createOrder, getOrder } from './cj.js'
import { sendOrderEmails } from './email.js'
import { saveOrder, type Order } from './orders.js'

const TRACKING_REFRESH_MS = 30 * 60 * 1000

export async function sendToCj(order: Order): Promise<void> {
  if (order.cj?.orderId || order.cj?.simulated) return
  if (order.mode === 'test' && process.env.CJ_TEST_ORDERS !== '1') {
    order.cj = { simulated: true }
    order.status = 'sent_to_cj'
    return
  }
  try {
    const cj = await createOrder({
      orderNumber: order.number,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
      phone: order.customer.phone,
      email: order.customer.email,
      address: order.address.line1,
      address2: order.address.line2,
      zip: order.address.zip,
      city: order.address.city,
      countryCode: order.address.countryCode,
      country: 'France',
      logisticName: SHIPPING.logisticName,
      fromCountryCode: SHIPPING.fromCountryCode,
      products: order.lines.map((l) => ({ vid: l.vid, quantity: l.quantity })),
      sandbox: order.mode === 'test',
      pay: order.mode === 'live',
    })
    order.cj = { orderId: cj.orderId, status: cj.orderStatus, amountUsd: cj.orderAmount, sandbox: order.mode === 'test', checkedAt: new Date().toISOString() }
    order.status = 'sent_to_cj'
  } catch (error) {
    order.cj = { ...order.cj, error: error instanceof Error ? error.message : String(error) }
    order.status = 'cj_error'
  }
}

/** Marks the order paid, hands it to CJ and sends the e-mails. Idempotent. */
export async function markPaid(order: Order, reference: string | undefined, origin: string): Promise<Order> {
  if (order.status !== 'pending_payment') return order
  order.status = 'paid'
  order.payment = { ...order.payment, reference: reference ?? order.payment.reference, paidAt: new Date().toISOString() }
  await saveOrder(order) // the payment is recorded even if the next steps fail
  await sendToCj(order)
  await saveOrder(order)
  await sendOrderEmails(order, origin).catch((error) => console.error('e-mail non envoyé :', error))
  return order
}

/** Asks CJ where the parcel is (at most every 30 minutes per order). */
export async function refreshTracking(order: Order): Promise<void> {
  const cj = order.cj
  if (!cj?.orderId || cj.simulated) return
  if (order.status !== 'sent_to_cj' && order.status !== 'shipped') return
  if (cj.checkedAt && Date.now() - Date.parse(cj.checkedAt) < TRACKING_REFRESH_MS) return
  try {
    const detail = await getOrder(cj.orderId)
    cj.status = detail.orderStatus ?? cj.status
    cj.trackNumber = detail.trackNumber ?? cj.trackNumber
    cj.trackingUrl = detail.trackingUrl ?? cj.trackingUrl
    cj.amountUsd = detail.orderAmount ?? cj.amountUsd
    if (detail.orderStatus === 'SHIPPED') order.status = 'shipped'
    if (detail.orderStatus === 'DELIVERED') order.status = 'delivered'
    if (detail.orderStatus === 'CANCELLED') order.status = 'cancelled'
  } catch {
    // CJ unreachable: keep what we know
  }
  cj.checkedAt = new Date().toISOString()
  await saveOrder(order)
}
