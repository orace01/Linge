import { timingSafeEqual } from 'node:crypto'
import { sendToCj } from '../../server/fulfil.js'
import { json } from '../../server/http.js'
import { adminOrder, listOrders, loadOrder, saveOrder } from '../../server/orders.js'

/** The merchant's password travels in the Authorization header: `Bearer <ADMIN_SECRET>`. */
function authorized(request: Request) {
  const secret = process.env.ADMIN_SECRET
  const given = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
  if (!secret || secret.length < 12) return false
  const a = Buffer.from(given)
  const b = Buffer.from(secret)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** GET -> the latest orders. */
export async function GET(request: Request) {
  if (!authorized(request)) return json({ error: 'Non autorisé' }, { status: 401 })
  return json({ orders: (await listOrders()).map(adminOrder) })
}

/** POST { id, action: 'retry-cj' } -> sends again to CJ an order that CJ had refused. */
export async function POST(request: Request) {
  if (!authorized(request)) return json({ error: 'Non autorisé' }, { status: 401 })
  const body = (await request.json().catch(() => null)) as { id?: unknown; action?: unknown } | null
  const order = typeof body?.id === 'string' ? await loadOrder(body.id) : null
  if (!order) return json({ error: 'Commande introuvable' }, { status: 404 })
  if (body?.action !== 'retry-cj' || order.status !== 'cj_error') return json({ error: 'Action impossible' }, { status: 400 })
  order.cj = undefined
  await sendToCj(order)
  await saveOrder(order)
  return json(adminOrder(order))
}
