export type Category = {
  slug: string
  name: string
  frameRatio: string
}

export const categories: Category[] = [
  { slug: 'soutiens-gorge', name: 'Soutiens-gorge', frameRatio: '3 / 4' },
  { slug: 'culottes', name: 'Culottes', frameRatio: '1 / 1' },
  { slug: 'ensembles', name: 'Ensembles', frameRatio: '4 / 5' },
  { slug: 'bodys', name: 'Bodys', frameRatio: '3 / 4' },
  { slug: 'lingerie-de-nuit', name: 'Lingerie de nuit', frameRatio: '4 / 5' },
]

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
}

export const products: Product[] = [
  { id: 'p1', slug: 'soutien-gorge-triangle', name: 'Soutien-gorge Triangle', category: 'Soutiens-gorge', price: 39, sizes: ['XS', 'S', 'M', 'L'], colors: ['Rose poudré', 'Prune'], cut: 'Triangle', isNew: true, inStock: true },
  { id: 'p2', slug: 'culotte-echancree', name: 'Culotte Échancrée', category: 'Culottes', price: 25, sizes: ['XS', 'S', 'M', 'L'], colors: ['Rose poudré', 'Ivoire'], cut: 'Échancrée', isNew: true, inStock: true },
  { id: 'p3', slug: 'ensemble-dentelle', name: 'Ensemble Dentelle', category: 'Ensembles', price: 74, sizes: ['XS', 'S', 'M', 'L'], colors: ['Bordeaux', 'Prune'], cut: 'Bandeau', isBestSeller: true, inStock: true },
  { id: 'p4', slug: 'body-graphique', name: 'Body Graphique', category: 'Bodys', price: 69, sizes: ['XS', 'S', 'M', 'L'], colors: ['Prune', 'Ivoire'], cut: 'Dos nu', inStock: true },
  { id: 'p5', slug: 'nuisette-satin', name: 'Nuisette Satin', category: 'Lingerie de nuit', price: 79, sizes: ['XS', 'S', 'M', 'L'], colors: ['Rose poudré', 'Bordeaux'], cut: 'Mi-cuisse', isBestSeller: true, inStock: true },
  { id: 'p6', slug: 'soutien-gorge-corbeille', name: 'Soutien-gorge Corbeille', category: 'Soutiens-gorge', price: 45, sizes: ['XS', 'S', 'M', 'L'], colors: ['Bordeaux', 'Ivoire'], cut: 'Corbeille', inStock: true },
  { id: 'p7', slug: 'culotte-taille-haute', name: 'Culotte Taille Haute', category: 'Culottes', price: 29, sizes: ['XS', 'S', 'M', 'L'], colors: ['Prune', 'Rose poudré'], cut: 'Taille haute', inStock: true },
  { id: 'p8', slug: 'ensemble-bandeau', name: 'Ensemble Bandeau', category: 'Ensembles', price: 69, sizes: ['XS', 'S', 'M', 'L'], colors: ['Ivoire', 'Bordeaux'], cut: 'Bandeau', isNew: true, inStock: true },
]

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug)
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug)
}
