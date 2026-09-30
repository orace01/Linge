import { checkCart, parseCart } from '../../server/checkout.js'
import { json } from '../../server/http.js'

/** POST { items: [{ slug, color, size, quantity }] } -> live stock + server-side prices. */
export async function POST(request: Request) {
  const lines = parseCart(await request.json().catch(() => null))
  if (!lines) return json({ error: 'Panier invalide' }, { status: 400 })
  try {
    return json(await checkCart(lines))
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, { status: 502 })
  }
}
