import { Link } from 'react-router-dom'
import type { Product } from '../data/catalog'
import { EmptyFrame } from './EmptyFrame'
import { useFavorites } from '../context/FavoritesContext'
import { HeartIcon } from './icons'

export function ProductCard({ product, tone = 'light' }: { product: Product; tone?: 'light' | 'dark' }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(product.slug)
  const badge = product.isNew ? 'Nouveau' : product.isBestSeller ? 'Best-seller' : null

  return (
    <Link to={`/produit/${product.slug}`} className="block w-full">
      <div className="relative">
        <EmptyFrame ratio="4 / 5" tone={tone} className="w-full" />
        {badge && (
          <span
            className={`absolute left-3.5 top-3.5 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wide ${
              tone === 'light' ? 'bg-raspberry text-white' : 'bg-ivory text-plum'
            }`}
          >
            {badge}
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite(product.slug)
          }}
          aria-label="Ajouter aux favoris"
          className={`absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full ${
            tone === 'light' ? 'bg-cream/80 text-plum' : 'bg-plum/40 text-ivory'
          }`}
        >
          <HeartIcon className="h-4 w-4" filled={fav} />
        </button>
      </div>
      <div className={`mt-3.5 flex items-start justify-between gap-2 ${tone === 'dark' ? 'text-ivory' : 'text-plum'}`}>
        <div>
          <p className="font-display text-lg">{product.name}</p>
          <p className={`mt-0.5 text-[11px] uppercase tracking-wide ${tone === 'dark' ? 'text-ivory/55' : 'plum-soft'}`}>
            {product.category} — {product.price}&nbsp;€
          </p>
        </div>
        <span
          className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-wide ${
            tone === 'dark' ? 'border-ivory/40 text-ivory' : 'border-plum/20 text-plum'
          }`}
        >
          Voir
        </span>
      </div>
    </Link>
  )
}
