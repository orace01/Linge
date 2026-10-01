import type { CheckoutMode } from '../src/lib/order-types.js'

/**
 * ORDER_MODE decides whether customers can order:
 * - off (default): the cart only checks stock, nothing can be ordered or paid
 * - test: full flow with a simulated payment; nothing is charged or shipped
 * - live: real payments (needs a payment provider) and real, paid CJ orders
 */
export function orderMode(): CheckoutMode {
  const mode = process.env.ORDER_MODE
  return mode === 'test' || mode === 'live' ? mode : 'off'
}
