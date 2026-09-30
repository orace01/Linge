import { Link } from 'react-router-dom'
import type { Product } from '../data/catalog'
import { EmptyFrame } from './EmptyFrame'
import { useFavorites } from '../context/FavoritesContext'
import { HeartIcon } from './icons'

export function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(product.slug)
  const badge = product.isNew ? 'Nouveau' : product.isBestSeller ? 'Best-seller' : null

  return (
    <Link to={`/produit/${product.slug}`} className="group block w-full">
      <div className="relative">
        <EmptyFrame ratio="4 / 5" className="w-full" />
        {badge && (
          <span className="absolute left-3.5 top-3.5 rounded-full bg-rose-soft px-3 py-1.5 text-[10px] uppercase tracking-wide text-wine">
            {badge}
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite(product.slug)
          }}
          aria-label="Ajouter aux favoris"
          className={`absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-surface/85 transition hover:text-wine ${
            fav ? 'text-wine' : 'text-ink'
          }`}
        >
          <HeartIcon className="h-4 w-4" filled={fav} />
        </button>
      </div>
      <div className="mt-3.5 flex items-start justify-between gap-2 text-ink">
        <div>
          <p className="font-display text-lg">{product.name}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-muted">
            {product.category} — {product.price}&nbsp;€
          </p>
        </div>
        <span className="whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-[11px] uppercase tracking-wide transition group-hover:border-wine group-hover:text-wine">
          Voir
        </span>
      </div>
    </Link>
  )
}
