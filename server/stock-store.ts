/*
  Where the stock snapshot lives: Vercel Blob in production, a local file
  (.data/stock.json) during development. On Vercel the SDK authenticates with
  OIDC + BLOB_STORE_ID (set when the store is connected to the project);
  elsewhere (GitHub Actions) with BLOB_READ_WRITE_TOKEN.
*/
import { get, put } from '@vercel/blob'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import type { StockSnapshot } from '../src/lib/stock.js'

const BLOB_PATH = 'lucea/stock.json'
const LOCAL_FILE = '.data/stock.json'

const blobEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)

export async function readSnapshot(): Promise<StockSnapshot | null> {
  try {
    if (blobEnabled()) {
      const result = await get(BLOB_PATH, { access: 'public', useCache: false })
      if (!result?.stream) return null
      return JSON.parse(await new Response(result.stream).text()) as StockSnapshot
    }
    if (process.env.VERCEL) return null
    return JSON.parse(await readFile(LOCAL_FILE, 'utf8')) as StockSnapshot
  } catch {
    return null
  }
}

export async function writeSnapshot(snapshot: StockSnapshot): Promise<void> {
  const body = JSON.stringify(snapshot)
  if (blobEnabled()) {
    await put(BLOB_PATH, body, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    })
    return
  }
  if (process.env.VERCEL) throw new Error('Stockage Blob non connecté au projet (BLOB_STORE_ID ou BLOB_READ_WRITE_TOKEN manquant)')
  await mkdir('.data', { recursive: true })
  await writeFile(LOCAL_FILE, body)
}
