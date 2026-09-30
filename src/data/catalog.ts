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
  Bordeaux: 'bordeaux',
  Prune: 'prune',
  Ivoire: 'ivoire',
}

export function colorwayOf(color: string): Colorway {
  return colorways[color] ?? 'rose'
}

export type Product = {
  id: string
  slug: string
  name: string
  category: string
  price: number
  sizes: string[]
  colors: string[]
  cut: string
  isNew?: boolean
  isBestSeller?: boolean
  inStock: boolean
  /** product visual; without one the card shows a silk swatch of the first colour */
  image?: string
}

export const products: Product[] = [
  { id: 'p1', slug: 'soutien-gorge-triangle', name: 'Soutien-gorge Triangle', category: 'Soutiens-gorge', price: 39, sizes: ['XS', 'S', 'M', 'L'], colors: ['Noir', 'Prune'], cut: 'Triangle', isNew: true, inStock: true, image: '/lucea/07-produit-triangle.webp' },
  { id: 'p2', slug: 'culotte-echancree', name: 'Culotte Échancrée', category: 'Culottes', price: 25, sizes: ['XS', 'S', 'M', 'L'], colors: ['Bordeaux', 'Rose poudré'], cut: 'Échancrée', isNew: true, inStock: true, image: '/lucea/08-produit-culotte-echancree.webp' },
  { id: 'p3', slug: 'ensemble-dentelle', name: 'Ensemble Dentelle', category: 'Ensembles', price: 74, sizes: ['XS', 'S', 'M', 'L'], colors: ['Bordeaux', 'Prune'], cut: 'Bandeau', isBestSeller: true, inStock: true },
  { id: 'p4', slug: 'body-graphique', name: 'Body Graphique', category: 'Bodys', price: 69, sizes: ['XS', 'S', 'M', 'L'], colors: ['Prune', 'Ivoire'], cut: 'Dos nu', inStock: true },
  { id: 'p5', slug: 'nuisette-satin', name: 'Nuisette Satin', category: 'Lingerie de nuit', price: 79, sizes: ['XS', 'S', 'M', 'L'], colors: ['Rose poudré', 'Bordeaux'], cut: 'Mi-cuisse', isBestSeller: true, inStock: true },
  { id: 'p6', slug: 'soutien-gorge-corbeille', name: 'Soutien-gorge Corbeille', category: 'Soutiens-gorge', price: 45, sizes: ['XS', 'S', 'M', 'L'], colors: ['Bordeaux', 'Ivoire'], cut: 'Corbeille', inStock: true },
  { id: 'p7', slug: 'culotte-taille-haute', name: 'Culotte Taille Haute', category: 'Culottes', price: 29, sizes: ['XS', 'S', 'M', 'L'], colors: ['Prune', 'Rose poudré'], cut: 'Taille haute', inStock: true },
  { id: 'p8', slug: 'ensemble-bandeau', name: 'Ensemble Bandeau', category: 'Ensembles', price: 69, sizes: ['XS', 'S', 'M', 'L'], colors: ['Bordeaux', 'Ivoire'], cut: 'Bandeau', isNew: true, inStock: true, image: '/lucea/09-produit-bandeau.webp' },
]

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug)
}
