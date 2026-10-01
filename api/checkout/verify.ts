import { checkCart, parseCart } from '../../server/checkout.js'
import { json } from '../../server/http.js'
import { orderMode } from '../../server/order-mode.js'
import { getPaymentProvider } from '../../server/payments/index.js'
import { round2, shippingFee } from '../../src/lib/shipping.js'

/** POST { items: [{ slug, color, size, quantity }] } -> live stock, server-side prices, and whether ordering is open. */
export async function POST(request: Request) {
  const lines = parseCart(await request.json().catch(() => null))
  if (!lines) return json({ error: 'Panier invalide' }, { status: 400 })
  try {
    const check = await checkCart(lines)
    const shipping = shippingFee(check.subtotal)
    const checkout = getPaymentProvider() ? orderMode() : 'off'
    return json({ ...check, shipping, total: round2(check.subtotal + shipping), checkout })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 })
  }
}
