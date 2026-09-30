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
  await throttle()

  const url = new URL(BASE + path)
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v)
  const res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const json = (await res.json().catch(() => null)) as CjEnvelope<T> | null
  const ok = res.ok && json !== null && (json.result === true || json.code === 200)
  if (!ok) throw new CjError(json?.message || `CJ HTTP ${res.status} on ${path}`, json?.code ?? res.status)
  return json.data
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
