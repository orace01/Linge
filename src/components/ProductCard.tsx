import { useState } from 'react'
import { Link } from 'react-router-dom'
import { colorwayOf, type Product } from '../data/catalog'
import { useFavorites } from '../context/FavoritesContext'
import { useStock } from '../context/StockContext'
import { FabricMedia } from './FabricMedia'
import { HeartIcon } from './icons'
import { formatPrice } from '../lib/format'

export function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [hovered, setHovered] = useState(false)
  const fav = isFavorite(product.slug)
  const soldOut = useStock().productLevel(product) === 'out'
  const badge = soldOut ? 'Épuisé' : product.isNew ? 'Nouveau' : product.isBestSeller ? 'Best-seller' : null

  return (
    <Link
      to={`/produit/${product.slug}`}
      className="group block w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="relative">
        {product.image ? (
          <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-surface-soft">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition-transform duration-[1800ms] ease-out ${
                hovered ? 'motion-safe:scale-[1.07]' : ''
              }`}
            />
          </div>
        ) : (
          <FabricMedia
            colorway={colorwayOf(product.colors[0])}
            active={hovered}
            zoom
            flip={Number(product.id.slice(1)) % 2 === 0}
            className="aspect-[4/5] rounded-2xl"
          />
        )}
        {badge && (
          <span
            className={`absolute left-3.5 top-3.5 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wide ${
              soldOut ? 'bg-surface text-ink-muted' : 'bg-rose-soft text-wine'
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
          className={`absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-surface/85 transition hover:text-wine ${
            fav ? 'text-wine' : 'text-ink'
          }`}
        >
          <HeartIcon className="h-4 w-4" filled={fav} />
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-2 text-ink">
        <div>
          <p className="font-display text-xl leading-tight transition group-hover:italic">{product.name}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wide text-ink-muted">
            {product.category} — {formatPrice(product.price)}
          </p>
        </div>
        <span className="whitespace-nowrap rounded-full border border-border px-4 py-1.5 text-[11px] uppercase tracking-wide transition group-hover:border-wine group-hover:text-wine">
          Voir
        </span>
      </div>
    </Link>
  )
}
