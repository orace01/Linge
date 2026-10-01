/*
  Orders: one JSON document per order.
  - On Vercel they live in the Blob store, encrypted with ORDERS_SECRET (the
    store is public: an order is only readable with its unguessable id AND the key).
  - In local development they are plain files in .data/orders/.
*/
import { get, list, put } from '@vercel/blob'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import type {
  AdminOrder,
  CheckoutMode,
  OrderAddress,
  OrderCustomer,
  OrderLine,
  OrderStatus,
  PublicOrder,
} from '../src/lib/order-types.js'

export type Order = {
  id: string
  number: string
  createdAt: string
  updatedAt: string
  status: OrderStatus
  mode: Exclude<CheckoutMode, 'off'>
  customer: OrderCustomer
  address: OrderAddress
  /** each line keeps the CJ variant id it was checked with */
  lines: (OrderLine & { vid: string })[]
  subtotal: number
  shipping: number
  total: number
  payment: { provider: string; reference?: string; paidAt?: string }
  cj?: {
    orderId?: string
    status?: string
    amountUsd?: number
    trackNumber?: string
    trackingUrl?: string
    simulated?: boolean
    sandbox?: boolean
    error?: string
    checkedAt?: string
  }
}

const BLOB_PREFIX = 'lucea/orders/'
const LOCAL_DIR = '.data/orders'
const ID_RE = /^[A-Za-z0-9_-]{22}$/

const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)

export function newOrderId() {
  return randomBytes(16).toString('base64url')
}

/** Short reference shown to the customer and sent to CJ, e.g. "LC-MUPB5K-7Q2". */
export function newOrderNumber() {
  const time = Date.now().toString(36).toUpperCase()
  const random = randomBytes(2).toString('hex').toUpperCase().slice(0, 3)
  return `LC-${time.slice(-6)}-${random}`
}

// --- encryption (AES-256-GCM) -------------------------------------------------
function key() {
  const secret = process.env.ORDERS_SECRET
  return secret ? createHash('sha256').update(secret).digest() : null
}

function seal(text: string): string {
  const k = key()
  if (!k) {
    if (blobEnabled()) throw new Error('ORDERS_SECRET manquant : les commandes ne peuvent pas être enregistrées')
    return text
  }
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', k, iv)
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') })
}

function open(stored: string): string {
  const parsed = JSON.parse(stored) as { v?: number; iv?: string; tag?: string; data?: string }
  if (parsed.v !== 1 || !parsed.iv || !parsed.tag || !parsed.data) return stored // plain (local development)
  const k = key()
  if (!k) throw new Error('ORDERS_SECRET manquant')
  const decipher = createDecipheriv('aes-256-gcm', k, Buffer.from(parsed.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(parsed.data, 'base64')), decipher.final()]).toString('utf8')
}

// --- storage --------------------------------------------------------------------
export async function saveOrder(order: Order): Promise<void> {
  order.updatedAt = new Date().toISOString()
  const body = seal(JSON.stringify(order))
  if (blobEnabled()) {
    await put(`${BLOB_PREFIX}${order.id}.json`, body, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    })
    return
  }
  if (process.env.VERCEL) throw new Error('Stockage Blob non connecté au projet')
  await mkdir(LOCAL_DIR, { recursive: true })
  await writeFile(`${LOCAL_DIR}/${order.id}.json`, body)
}

export async function loadOrder(id: string): Promise<Order | null> {
  if (!ID_RE.test(id)) return null
  try {
    if (blobEnabled()) {
      const result = await get(`${BLOB_PREFIX}${id}.json`, { access: 'public', useCache: false })
      if (!result?.stream) return null
      return JSON.parse(open(await new Response(result.stream).text())) as Order
    }
    if (process.env.VERCEL) return null
    return JSON.parse(open(await readFile(`${LOCAL_DIR}/${id}.json`, 'utf8'))) as Order
  } catch {
    return null
  }
}

/** Most recent orders first (admin page). */
export async function listOrders(limit = 100): Promise<Order[]> {
  let ids: string[] = []
  if (blobEnabled()) {
    const { blobs } = await list({ prefix: BLOB_PREFIX, limit: 1000 })
    ids = blobs.map((b) => b.pathname.slice(BLOB_PREFIX.length).replace(/\.json$/, ''))
  } else if (!process.env.VERCEL) {
    ids = (await readdir(LOCAL_DIR).catch(() => [])).map((f) => f.replace(/\.json$/, ''))
  }
  const orders = (await Promise.all(ids.map((id) => loadOrder(id)))).filter((o): o is Order => o !== null)
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
}

// --- views --------------------------------------------------------------------
export function publicOrder(order: Order): PublicOrder {
  return {
    id: order.id,
    number: order.number,
    createdAt: order.createdAt,
    // the customer never sees that CJ refused an order: for them it is paid and being prepared
    status: order.status === 'cj_error' ? 'paid' : order.status,
    test: order.mode === 'test',
    lines: order.lines.map(({ slug, name, color, size, quantity, unitPrice }) => ({ slug, name, color, size, quantity, unitPrice })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    firstName: order.customer.firstName,
    city: order.address.city,
    tracking: order.cj?.trackNumber ? { number: order.cj.trackNumber, url: order.cj.trackingUrl } : null,
  }
}

export function adminOrder(order: Order): AdminOrder {
  return {
    ...publicOrder(order),
    status: order.status,
    customer: order.customer,
    address: order.address,
    paidAt: order.payment.paidAt,
    cj: order.cj
      ? {
          orderId: order.cj.orderId,
          status: order.cj.status,
          amountUsd: order.cj.amountUsd,
          simulated: order.cj.simulated,
          sandbox: order.cj.sandbox,
          error: order.cj.error,
        }
      : null,
  }
}
