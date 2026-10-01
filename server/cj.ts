/*
  Minimal CJdropshipping API v2 client (server only - the API key must never
  reach the browser). Limits: 1 request / second, 1000 / day on free accounts.
  Without CJ_API_KEY every call is answered by the mock (server/mock.ts).

  Stock is only available per variant (/product/stock/queryByVid): the product
  query returns `inventories: null`, and there is no per-product stock endpoint.
*/
import { EU_WAREHOUSES, type VariantStock } from '../src/lib/stock.js'
import { mockProduct, mockStock } from './mock.js'

const BASE = 'https://developers.cjdropshipping.com/api2.0/v1'
const MIN_INTERVAL_MS = 1100

/** One warehouse area; the live API uses the *Num names, the docs the short ones. */
export type CjInventory = {
  countryCode?: string
  areaEn?: string
  totalInventoryNum?: number
  cjInventoryNum?: number
  factoryInventoryNum?: number
  totalInventory?: number
  cjInventory?: number
  factoryInventory?: number
}

export type CjVariantDetail = {
  vid: string
  variantSku?: string
  variantKey?: string
  variantNameEn?: string
  variantSellPrice?: number | string
  variantImage?: string
}

export type CjProductDetail = {
  pid: string
  productNameEn?: string
  productSku?: string
  bigImage?: string
  productImage?: string | string[]
  productImageSet?: string[]
  sellPrice?: number | string
  /** CJ's suggested retail price, USD */
  suggestSellPrice?: number | string
  description?: string
  variants?: CjVariantDetail[]
}

type CjEnvelope<T> = { code?: number; result?: boolean; message?: string; data: T }

export class CjError extends Error {
  code?: number
  constructor(message: string, code?: number) {
    super(message)
    this.name = 'CjError'
    this.code = code
  }
}

export const cjEnabled = () => Boolean(process.env.CJ_API_KEY)

let lastCall = 0
let token: { value: string; expires: number } | null = null

async function throttle() {
  const wait = lastCall + MIN_INTERVAL_MS - Date.now()
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastCall = Date.now()
}

async function request<T>(
  path: string,
  { method = 'GET', query, body, auth = true }: { method?: 'GET' | 'POST'; query?: Record<string, string>; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) headers['CJ-Access-Token'] = await accessToken()
  const url = new URL(BASE + path)
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v)

  // CJ sometimes answers "Too Many Requests" even at 1 call per second: wait and retry
  for (let attempt = 1; ; attempt++) {
    await throttle()
    const res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
    const json = (await res.json().catch(() => null)) as CjEnvelope<T> | null
    if (res.ok && json !== null && (json.result === true || json.code === 200)) return json.data
    const message = json?.message || `CJ HTTP ${res.status} on ${path}`
    const tooMany = res.status === 429 || /too many requests/i.test(message)
    if (!tooMany || attempt >= 3) throw new CjError(message, json?.code ?? res.status)
    await new Promise((r) => setTimeout(r, 1500 * attempt))
  }
}

/** Access tokens last 180 days; CJ returns the same one for 24h, we keep it while the instance lives. */
async function accessToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value
  const apiKey = process.env.CJ_API_KEY
  if (!apiKey) throw new CjError('CJ_API_KEY manquante')
  const data = await request<{ accessToken: string; accessTokenExpiryDate?: string }>('/authentication/getAccessToken', {
    method: 'POST',
    body: { apiKey },
    auth: false,
  })
  const expires = data.accessTokenExpiryDate ? Date.parse(data.accessTokenExpiryDate) : Date.now() + 24 * 3600_000
  token = { value: data.accessToken, expires: Number.isNaN(expires) ? Date.now() + 24 * 3600_000 : expires }
  return token.value
}

/** Product with its variants (one call; no stock in it). */
export async function getProduct(ref: { pid?: string; productSku?: string }): Promise<CjProductDetail> {
  if (!cjEnabled()) return mockProduct(ref.productSku ?? ref.pid ?? 'MOCK')
  const query: Record<string, string> = ref.pid ? { pid: ref.pid } : { productSku: ref.productSku ?? '' }
  const product = await request<CjProductDetail | null>('/product/query', { query })
  if (!product) throw new CjError(`Produit CJ introuvable : ${ref.pid ?? ref.productSku}`)
  return product
}

/** Stock summed over warehouses (CJ warehouses + supplier stock). */
export function stockFromInventories(inventories: CjInventory[] | null | undefined): VariantStock {
  const list = inventories ?? []
  const count = (i: CjInventory) =>
    i.totalInventoryNum ??
    i.totalInventory ??
    (i.cjInventoryNum ?? i.cjInventory ?? 0) + (i.factoryInventoryNum ?? i.factoryInventory ?? 0)
  return {
    qty: list.reduce((sum, i) => sum + count(i), 0),
    eu: list.some((i) => EU_WAREHOUSES.has((i.countryCode ?? '').toUpperCase()) && count(i) > 0),
  }
}

/** Live stock of one variant (one call). */
export async function getVariantStock(vid: string): Promise<VariantStock> {
  if (!cjEnabled()) return mockStock(vid)
  return stockFromInventories(await request<CjInventory[] | null>('/product/stock/queryByVid', { query: { vid } }))
}

export function productImages(product: CjProductDetail): string[] {
  let images: string[] = []
  if (Array.isArray(product.productImageSet)) images = product.productImageSet
  else if (Array.isArray(product.productImage)) images = product.productImage
  else if (typeof product.productImage === 'string') {
    try {
      const parsed = JSON.parse(product.productImage)
      images = Array.isArray(parsed) ? parsed : [product.productImage]
    } catch {
      images = [product.productImage]
    }
  }
  if (product.bigImage) images = [product.bigImage, ...images]
  return [...new Set(images.filter((u) => typeof u === 'string' && u.startsWith('http')))]
}

// --- orders -----------------------------------------------------------------

export type CjOrderInput = {
  orderNumber: string
  customerName: string
  phone: string
  email: string
  address: string
  address2: string
  zip: string
  city: string
  countryCode: string
  country: string
  logisticName: string
  fromCountryCode: string
  products: { vid: string; quantity: number }[]
  /** true: CJ sandbox order - simulated payment, nothing charged, nothing shipped */
  sandbox: boolean
  /** true: pay from the CJ balance right away; false: create the order only */
  pay: boolean
  remark?: string
}

export type CjOrder = {
  orderId: string
  orderStatus?: string
  orderAmount?: number
  productAmount?: number
  postageAmount?: number
  trackNumber?: string
  trackingUrl?: string
  logisticName?: string
}

/**
 * Creates the order at CJ. EU destinations need an IOSS choice: our own number
 * (CJ_IOSS_NUMBER) or, by default, CJ's IOSS (CJ then charges the import VAT).
 */
export async function createOrder(input: CjOrderInput): Promise<CjOrder> {
  if (!cjEnabled()) return { orderId: `MOCK-${input.orderNumber}`, orderStatus: 'CREATED' }
  const ioss = process.env.CJ_IOSS_NUMBER
  const created = await request<{ orderId?: string } | null>('/shopping/order/createOrderV2', {
    method: 'POST',
    body: {
      orderNumber: input.orderNumber,
      shippingCustomerName: input.customerName,
      shippingPhone: input.phone,
      email: input.email,
      shippingAddress: input.address,
      shippingAddress2: input.address2,
      shippingZip: input.zip,
      shippingCity: input.city,
      shippingProvince: input.city, // France has no provinces; CJ requires the field
      shippingCountryCode: input.countryCode,
      shippingCountry: input.country,
      logisticName: input.logisticName,
      fromCountryCode: input.fromCountryCode,
      remark: input.remark ?? '',
      iossType: ioss ? 2 : 3,
      ...(ioss ? { iossNumber: ioss } : {}),
      payType: input.pay ? 2 : 3, // always explicit: CJ's default would pay from the balance
      isSandbox: input.sandbox ? 1 : 0,
      products: input.products,
    },
  })
  if (!created?.orderId) throw new CjError('CJ n’a pas renvoyé de numéro de commande')
  // amounts and status are only in the order detail
  const detail = await getOrder(created.orderId).catch(() => null)
  return { ...detail, orderId: created.orderId }
}

export async function getOrder(orderId: string): Promise<CjOrder> {
  if (!cjEnabled()) return { orderId, orderStatus: 'CREATED' }
  const data = await request<Record<string, unknown> | null>('/shopping/order/getOrderDetail', { query: { orderId } })
  if (!data) throw new CjError(`Commande CJ introuvable : ${orderId}`)
  const text = (value: unknown) => (typeof value === 'string' && value ? value : undefined)
  const amount = (value: unknown) => (value === null || value === undefined || value === '' ? undefined : Number(value))
  return {
    orderId,
    orderStatus: text(data.orderStatus),
    orderAmount: amount(data.orderAmount),
    productAmount: amount(data.productAmount),
    postageAmount: amount(data.postageAmount),
    trackNumber: text(data.trackNumber),
    trackingUrl: text(data.trackingUrl),
    logisticName: text(data.logisticName),
  }
}
