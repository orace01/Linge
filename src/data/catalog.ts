import { cjCatalog } from './cj-catalog.js'
import type { CjCatalogProduct } from './cj-types.js'
import { compareSizes } from '../lib/sizes.js'

export type Category = {
  slug: string
  name: string
  image: string
}

export const categories: Category[] = [
  { slug: 'soutiens-gorge', name: 'Soutiens-gorge', image: '/lucea/02-categorie-soutiens-gorge.webp' },
  { slug: 'culottes', name: 'Culottes', image: '/lucea/03-categorie-culottes.webp' },
  { slug: 'ensembles', name: 'Ensembles', image: '/lucea/04-categorie-ensembles.webp' },
  { slug: 'bodys', name: 'Bodys', image: '/lucea/05-categorie-bodys.webp' },
  { slug: 'lingerie-de-nuit', name: 'Lingerie de nuit', image: '/lucea/06-categorie-nuit.webp' },
]

/** Silk swatch (still + cinemagraph loop) shown for each colour until product photos exist. */
export type Colorway = 'rose' | 'bordeaux' | 'prune' | 'ivoire'

const colorways: Record<string, Colorway> = {
  'Rose poudré': 'rose',
  Rose: 'rose',
  Bordeaux: 'bordeaux',
  Rouge: 'bordeaux',
  Prune: 'prune',
  Violet: 'prune',
  Ivoire: 'ivoire',
  Blanc: 'ivoire',
  Beige: 'ivoire',
}

export function colorwayOf(color: string): Colorway {
  return colorways[color] ?? 'rose'
}

/** One buyable combination; `vid` is the CJ variant id (stock and orders). */
export type Variant = {
  vid: string
  color: string
  size: string
  image?: string
}

export type Product = {
  id: string
  slug: string
  name: string
  category: string
  price: number
  sizes: string[]
  colors: string[]
  variants: Variant[]
  cut?: string
  description?: string
  isNew?: boolean
  isBestSeller?: boolean
  /** main visual; without one the card shows a silk swatch of the first colour */
  image?: string
  images?: string[]
  defaultColor?: string
  source: 'demo' | 'cj'
}

type DemoProduct = Omit<Product, 'variants' | 'source'>

// Stand-in products, shown until the CJ selection is imported.
const demoProducts: DemoProduct[] = [
  { id: 'p1', slug: 'soutien-gorge-triangle', name: 'Soutien-gorge Triangle', category: 'Soutiens-gorge', price: 39, sizes: ['XS', 'S', 'M', 'L'], colors: ['Noir', 'Prune'], cut: 'Triangle', isNew: true, image: '/lucea/07-produit-triangle.webp' },
  { id: 'p2', slug: 'culotte-echancree', name: 'Culotte Échancrée', category: 'Culottes', price: 25, sizes: ['XS', 'S', 'M', 'L'], colors: ['Bordeaux', 'Rose poudré'], cut: 'Échancrée', isNew: true, image: '/lucea/08-produit-culotte-echancree.webp' },
  { id: 'p3', slug: 'ensemble-dentelle', name: 'Ensemble Dentelle', category: 'Ensembles', price: 74, sizes: ['XS', 'S', 'M', 'L'], colors: ['Bordeaux', 'Prune'], cut: 'Bandeau', isBestSeller: true },
  { id: 'p4', slug: 'body-graphique', name: 'Body Graphique', category: 'Bodys', price: 69, sizes: ['XS', 'S', 'M', 'L'], colors: ['Prune', 'Ivoire'], cut: 'Dos nu' },
  { id: 'p5', slug: 'nuisette-satin', name: 'Nuisette Satin', category: 'Lingerie de nuit', price: 79, sizes: ['XS', 'S', 'M', 'L'], colors: ['Rose poudré', 'Bordeaux'], cut: 'Mi-cuisse', isBestSeller: true },
  { id: 'p6', slug: 'soutien-gorge-corbeille', name: 'Soutien-gorge Corbeille', category: 'Soutiens-gorge', price: 45, sizes: ['XS', 'S', 'M', 'L'], colors: ['Bordeaux', 'Ivoire'], cut: 'Corbeille' },
  { id: 'p7', slug: 'culotte-taille-haute', name: 'Culotte Taille Haute', category: 'Culottes', price: 29, sizes: ['XS', 'S', 'M', 'L'], colors: ['Prune', 'Rose poudré'], cut: 'Taille haute' },
  { id: 'p8', slug: 'ensemble-bandeau', name: 'Ensemble Bandeau', category: 'Ensembles', price: 69, sizes: ['XS', 'S', 'M', 'L'], colors: ['Bordeaux', 'Ivoire'], cut: 'Bandeau', isNew: true, image: '/lucea/09-produit-bandeau.webp' },
]

function fromDemo(p: DemoProduct): Product {
  const variants = p.colors.flatMap((color) =>
    p.sizes.map((size) => ({ vid: `demo-${p.id}-${color}-${size}`.replace(/\s+/g, '_'), color, size })),
  )
  return { ...p, variants, source: 'demo' }
}

function unique(values: string[]) {
  return [...new Set(values)]
}

function fromCj(p: CjCatalogProduct): Product {
  const images = p.images.length ? p.images : undefined
  return {
    id: p.pid,
    slug: p.slug,
    name: p.name,
    category: categories.find((c) => c.slug === p.category)?.name ?? p.category,
    price: p.price,
    sizes: unique(p.variants.map((v) => v.size)).sort(compareSizes),
    colors: unique(p.variants.map((v) => v.color)),
    variants: p.variants.map(({ vid, color, size, image }) => ({ vid, color, size, image })),
    description: p.description,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    image: images?.[0],
    images,
    defaultColor: p.defaultColor,
    source: 'cj',
  }
}

/** true until the CJ selection has been imported */
export const usesDemoCatalog = cjCatalog.products.length === 0

export const products: Product[] = usesDemoCatalog ? demoProducts.map(fromDemo) : cjCatalog.products.map(fromCj)

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug)
}

export function findVariant(product: Product, color: string, size: string) {
  return product.variants.find((v) => v.color === color && v.size === size)
}
