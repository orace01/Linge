/*
  The shop's single shipping mode. `logisticName` is the exact CJ name, used
  when orders are created at CJ; the delay is CJ's transit time to France
  (it does not include CJ's preparation time before dispatch).
*/
export const SHIPPING = {
  logisticName: 'CJPacket Fast Ordinary',
  fromCountryCode: 'CN',
  minDays: 4,
  maxDays: 7,
} as const

/** e.g. "livraison en 4 à 7 jours après expédition" */
export const DELIVERY_ESTIMATE = `${SHIPPING.minDays} à ${SHIPPING.maxDays} jours après expédition`

/** What the customer pays for delivery (EUR): a flat fee, free from a basket amount. */
export const SHIPPING_FEE = 4.9
export const FREE_SHIPPING_FROM = 60

export function shippingFee(subtotal: number) {
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE
}

export const round2 = (value: number) => Math.round(value * 100) / 100
