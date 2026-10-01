/*
  npm run cj:import             -> real import (needs CJ_API_KEY in .env.local)
  npm run cj:import -- --mock   -> simulated data, to try the site without the key
  npm run cj:import -- --no-images  -> keep CJ image URLs instead of downloading them

  Reads cj/selection.json, fetches each product from CJ and writes
  src/data/cj-catalog.ts. Photos are saved as WebP (1100 px max) in
  public/products/<sku>/, named after their CJ URL - files that already exist
  are never overwritten, so retouched photos are kept.
*/
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import { categories } from '../src/data/catalog.js'
import type { CjCatalog, CjCatalogProduct, CjCatalogVariant } from '../src/data/cj-types.js'
import { compareSizes } from '../src/lib/sizes.js'
import { loadEnvLocal } from './env.js'

loadEnvLocal()
const args = new Set(process.argv.slice(2))
const MOCK = args.has('--mock')
const DOWNLOAD = !args.has('--no-images') && !MOCK
if (MOCK) delete process.env.CJ_API_KEY
else if (!process.env.CJ_API_KEY) {
  console.error('✗ CJ_API_KEY introuvable. Ajoute-la dans .env.local (ou lance `npm run cj:import -- --mock` pour tester).')
  process.exit(1)
}

const { getProduct, productImages } = await import('../server/cj.js')

// --- selection ---------------------------------------------------------------
type SelectionItem = {
  sku?: string
  pid?: string
  category: string
  name?: string
  description?: string
  price?: number
  isNew?: boolean
  isBestSeller?: boolean
  /** hide some CJ colours, e.g. ["Blue"] (CJ names or French names) */
  excludeColors?: string[]
  colorNames?: Record<string, string>
  /** CJ product photos to leave out, by position (1 = first), e.g. a size chart */
  skipPhotos?: number[]
  /** CJ photo shown first (cards, product page), by position */
  mainPhoto?: number
  /** colour selected when the product page opens (French name), e.g. the one on the main photo */
  defaultColor?: string
}
type Selection = {
  pricing: { usdToEur: number; markup: number }
  products: SelectionItem[]
}

const selection = JSON.parse(readFileSync('cj/selection.json', 'utf8')) as Selection
const categorySlugs = new Set(categories.map((c) => c.slug))

// --- helpers -----------------------------------------------------------------
const COLORS: Record<string, string> = {
  black: 'Noir', white: 'Blanc', red: 'Rouge', 'wine red': 'Bordeaux', wine: 'Bordeaux', burgundy: 'Bordeaux',
  claret: 'Bordeaux', 'dark red': 'Bordeaux', pink: 'Rose', 'light pink': 'Rose poudré', 'nude pink': 'Rose poudré',
  purple: 'Violet', violet: 'Violet', 'dark purple': 'Prune', plum: 'Prune', blue: 'Bleu', 'navy blue': 'Bleu marine',
  navy: 'Bleu marine', green: 'Vert', beige: 'Beige', apricot: 'Abricot', nude: 'Nude', skin: 'Nude', 'skin color': 'Nude',
  khaki: 'Kaki', coffee: 'Café', brown: 'Marron', gray: 'Gris', grey: 'Gris', yellow: 'Jaune', orange: 'Orange',
  champagne: 'Champagne', ivory: 'Ivoire', gold: 'Doré', silver: 'Argent', leopard: 'Léopard',
}
const SIZE_RE = /^(XXS|XS|S|M|L|XL|XXL|XXXL|[2-6]XL|\d{2,3}[A-H]{0,3}|ONE ?SIZE|FREE ?SIZE)$/i

// longest names first, so "wine red" wins over "red"
const COLOR_WORDS = Object.keys(COLORS).sort((a, b) => b.length - a.length)

function frenchColor(raw: string, overrides: Record<string, string> = {}) {
  const text = raw.trim().replace(/\s+/g, ' ')
  const key = text.toLowerCase()
  if (overrides[text]) return overrides[text]
  if (COLORS[key]) return COLORS[key]
  // descriptive CJ names, e.g. "red lace open crotch set" -> "Rouge"
  const word = COLOR_WORDS.find((w) => new RegExp(`\\b${w}\\b`).test(key))
  if (word) return COLORS[word]
  return text.replace(/\b\w/g, (c) => c.toUpperCase())
}

function splitVariantKey(key: string) {
  const parts = key.split(/\s*-\s*/).map((p) => p.trim()).filter(Boolean)
  const sizeIndex = parts.findIndex((p) => SIZE_RE.test(p))
  const rawSize = sizeIndex >= 0 ? parts.splice(sizeIndex, 1)[0] : 'Unique'
  const size = sizeIndex < 0 || /one ?size|free ?size/i.test(rawSize) ? 'Unique' : rawSize.toUpperCase()
  return { color: parts.join(' ') || 'Unique', size }
}

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

function sellingPrice(maxCostUsd: number) {
  const eur = maxCostUsd * selection.pricing.usdToEur * selection.pricing.markup
  return Math.max(9.9, Math.ceil(eur) - 0.1) // 23.46 -> 23.90
}

async function download(url: string, dir: string) {
  // named after the CJ URL: a retouched file stays attached to its photo whatever the order
  const file = `${dir}/${createHash('sha1').update(url).digest('hex').slice(0, 10)}.webp`
  const publicPath = file.replace(/^public/, '')
  if (existsSync(file)) return publicPath
  const res = await fetch(url)
  if (!res.ok) throw new Error(`image ${res.status}: ${url}`)
  await sharp(Buffer.from(await res.arrayBuffer()))
    .rotate()
    .resize({ width: 1100, height: 1400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(file)
  return publicPath
}

// --- import ------------------------------------------------------------------
const out: CjCatalogProduct[] = []
const slugs = new Set<string>()
const warnings: string[] = []

for (const [i, item] of selection.products.entries()) {
  const ref = item.pid ?? item.sku
  if (!ref) {
    warnings.push(`#${i + 1} : ni "sku" ni "pid", ignoré`)
    continue
  }
  if (!categorySlugs.has(item.category)) {
    warnings.push(`${ref} : catégorie "${item.category}" inconnue (${[...categorySlugs].join(', ')}), ignoré`)
    continue
  }
  process.stdout.write(`[${i + 1}/${selection.products.length}] ${ref} … `)
  try {
    const detail = await getProduct(item.pid ? { pid: item.pid } : { productSku: item.sku })
    const excluded = new Set((item.excludeColors ?? []).map((c) => c.toLowerCase()))

    const mapped = (detail.variants ?? [])
      .map((v) => {
        const { color: rawColor, size } = splitVariantKey(v.variantKey ?? v.variantNameEn ?? '')
        return {
          vid: v.vid,
          sku: v.variantSku ?? '',
          key: v.variantKey ?? '',
          rawColor,
          color: frenchColor(rawColor, item.colorNames),
          size,
          cost: Number(v.variantSellPrice ?? detail.sellPrice ?? 0),
          image: v.variantImage,
        }
      })
      .filter((v) => !excluded.has(v.rawColor.toLowerCase()) && !excluded.has(v.color.toLowerCase()))

    // two different CJ variants translated to the same colour (e.g. "red set A" / "red set B"):
    // keep their CJ names so each colour + size stays unique
    const rawByColor = new Map<string, Set<string>>()
    for (const v of mapped) rawByColor.set(v.color, (rawByColor.get(v.color) ?? new Set()).add(v.rawColor))
    const variants: CjCatalogVariant[] = mapped
      .map(({ rawColor, ...v }) => {
        if ((rawByColor.get(v.color)?.size ?? 0) < 2) return v
        warnings.push(`${ref} : "${rawColor}" gardé tel quel (plusieurs variantes donnent "${v.color}"), à renommer via colorNames`)
        return { ...v, color: rawColor.replace(/\b\w/g, (c) => c.toUpperCase()) }
      })
      .sort((a, b) => a.color.localeCompare(b.color) || compareSizes(a.size, b.size))

    if (!variants.length) throw new Error('aucune variante')

    const name = item.name ?? (detail.productNameEn ?? ref).replace(/\s+/g, ' ').trim()
    if (!item.name) warnings.push(`${ref} : pas de nom français, titre CJ utilisé ("${name}")`)
    let slug = slugify(name) || slugify(ref)
    while (slugs.has(slug)) slug = `${slug}-${slugs.size}`
    slugs.add(slug)

    const skipped = new Set(item.skipPhotos ?? [])
    const cjImages = productImages(detail)
    const main = item.mainPhoto ? cjImages[item.mainPhoto - 1] : undefined
    let images = cjImages.filter((url, n) => !skipped.has(n + 1) && url !== main)
    if (main) images = [main, ...images]
    const variantImages = [...new Set(variants.map((v) => v.image).filter((u): u is string => Boolean(u)))]
    if (DOWNLOAD) {
      const dir = `public/products/${detail.productSku ?? ref}`
      await mkdir(dir, { recursive: true })
      const all = [...new Set([...images, ...variantImages])]
      const local = new Map<string, string>()
      for (const url of all) local.set(url, await download(url, dir))
      images = images.map((u) => local.get(u) ?? u)
      for (const v of variants) if (v.image) v.image = local.get(v.image) ?? v.image
      // photos no longer used (skipped, gone at CJ) are removed
      const used = new Set([...local.values()].map((path) => path.split('/').pop()))
      for (const file of await readdir(dir)) if (file.endsWith('.webp') && !used.has(file)) await rm(`${dir}/${file}`)
    }

    const maxCost = Math.max(...variants.map((v) => v.cost))
    out.push({
      pid: detail.pid,
      sku: detail.productSku ?? ref,
      slug,
      name,
      cjName: detail.productNameEn ?? '',
      description: item.description,
      category: item.category,
      price: item.price ?? sellingPrice(maxCost),
      images,
      defaultColor: item.defaultColor,
      variants,
      isNew: item.isNew,
      isBestSeller: item.isBestSeller,
    })
    const suggested = Number(detail.suggestSellPrice)
    console.log(
      `✓ ${variants.length} variantes, ${images.length} photos, prix ${out[out.length - 1].price} € ` +
        `(coût max ${maxCost} $${suggested ? `, prix conseillé CJ ${suggested} $` : ''})`,
    )
  } catch (error) {
    console.log('✗')
    warnings.push(`${ref} : ${error instanceof Error ? error.message : String(error)}`)
  }
}

const catalog: CjCatalog = { generatedAt: new Date().toISOString(), ...(MOCK ? { mock: true } : {}), products: out }
await writeFile(
  'src/data/cj-catalog.ts',
  `// Generated by \`npm run cj:import\` from cj/selection.json - do not edit by hand.\nimport type { CjCatalog } from './cj-types.js'\n\nexport const cjCatalog: CjCatalog = ${JSON.stringify(catalog, null, 2)}\n`,
)

console.log(`\n${out.length}/${selection.products.length} produits importés dans src/data/cj-catalog.ts${MOCK ? ' (SIMULÉS)' : ''}`)
if (warnings.length) console.log(`\nÀ vérifier :\n- ${warnings.join('\n- ')}`)
