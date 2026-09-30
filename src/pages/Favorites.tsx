import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { getProductBySlug } from '../data/catalog'
import { ProductCard } from '../components/ProductCard'

export function Favorites() {
  const { favorites } = useFavorites()
  const items = favorites.map((slug) => getProductBySlug(slug)).filter(Boolean) as NonNullable<
    ReturnType<typeof getProductBySlug>
  >[]

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12 lg:px-10 lg:py-16">
      <h1 className="mb-10 font-display text-4xl text-ink">Mes favoris</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-ink-muted">Vous n'avez pas encore de favoris.</p>
          <Link
            to="/boutique"
            className="mt-6 inline-block rounded-full bg-wine px-8 py-3.5 text-xs uppercase tracking-widest text-surface transition hover:bg-wine-hover"
          >
            Voir la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
