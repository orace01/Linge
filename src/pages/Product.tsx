import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { colorwayOf, getProductBySlug, products } from '../data/catalog'
import { FabricMedia } from '../components/FabricMedia'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { HeartIcon } from '../components/icons'

export function Product() {
  const { slug } = useParams<{ slug: string }>()
  const product = slug ? getProductBySlug(slug) : undefined
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [color, setColor] = useState(product?.colors[0] ?? '')
  const [size, setSize] = useState(product?.sizes[1] ?? product?.sizes[0] ?? '')
  const [added, setAdded] = useState(false)
  const [galleryHover, setGalleryHover] = useState(false)

  if (!product) return <Navigate to="/boutique" replace />

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)
  const fav = isFavorite(product.slug)

  const handleAdd = () => {
    addItem({ slug: product.slug, color, size, quantity: 1 })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10 lg:py-14">
      <div className="mb-6 text-xs text-ink-muted lg:mb-8">
        <Link to="/" className="hover:text-ink">Accueil</Link>
        &nbsp;/&nbsp;
        <Link to="/boutique" className="hover:text-ink">Boutique</Link>
        &nbsp;/&nbsp;
        <span className="text-ink">{product.name}</span>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        {/* gallery */}
        <div className="lg:w-[560px] lg:flex-shrink-0">
          <div onMouseEnter={() => setGalleryHover(true)} onMouseLeave={() => setGalleryHover(false)}>
            {product.image ? (
              <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-surface-soft">
                <img
                  src={product.image}
                  alt={product.name}
                  className={`h-full w-full object-cover transition-transform duration-[1800ms] ease-out ${
                    galleryHover ? 'motion-safe:scale-[1.07]' : ''
                  }`}
                />
              </div>
            ) : (
              <FabricMedia
                key={color}
                colorway={colorwayOf(color)}
                active={galleryHover}
                zoom
                alt={`${product.name}, coloris ${color}`}
                className="aspect-[4/5] w-full rounded-3xl"
              />
            )}
          </div>
          {/* colour swatches only when the visual is a fabric swatch (a photo shows one colour) */}
          {!product.image && (
            <div className="mt-4 flex gap-4">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Voir le coloris ${c}`}
                  className={`overflow-hidden rounded-xl ring-offset-2 ring-offset-page transition ${
                    c === color ? 'ring-2 ring-wine' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <FabricMedia colorway={colorwayOf(c)} motion="still" className="aspect-[3/4] w-20" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div className="lg:flex-1">
          <span className="text-xs uppercase tracking-[0.16em] text-wine">{product.category}</span>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl">{product.name}</h1>
            <button
              onClick={() => toggleFavorite(product.slug)}
              aria-label="Ajouter aux favoris"
              className={`mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border transition hover:text-wine ${
                fav ? 'text-wine' : 'text-ink'
              }`}
            >
              <HeartIcon className="h-4 w-4" filled={fav} />
            </button>
          </div>
          <p className="mt-4 text-xl text-ink">{product.price}&nbsp;€</p>
          <p className="mt-6 max-w-lg text-sm font-light leading-relaxed text-ink-muted">
            Coupe {product.cut.toLowerCase()}, pensée pour un maintien confortable et une silhouette sculptée.
          </p>

          <div className="mt-8">
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-muted">Couleur — {color}</span>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`rounded-full border px-4 py-2 text-xs transition ${
                    c === color ? 'border-wine bg-wine text-surface' : 'border-border text-ink hover:border-wine'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.1em] text-ink-muted">Taille</span>
              <Link to="/guide-des-tailles" className="text-[11px] uppercase tracking-[0.1em] text-wine underline">
                Guide des tailles
              </Link>
            </div>
            <div className="mt-2.5 flex gap-2.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm transition ${
                    s === size ? 'bg-wine text-surface' : 'border border-border text-ink hover:border-wine'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <p className={`mt-6 text-xs ${product.inStock ? 'text-success' : 'text-error'}`}>
            {product.inStock ? '● En stock — expédition sous 48h' : '○ Rupture de stock temporaire'}
          </p>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="mt-5 w-full rounded-full bg-wine py-4 text-xs font-medium uppercase tracking-widest text-surface transition hover:bg-wine-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-12"
          >
            {added ? 'Ajouté au panier ✓' : 'Ajouter au panier'}
          </button>

          <div className="mt-10 space-y-6 border-t border-border pt-6">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between text-xs uppercase tracking-[0.1em] text-ink">
                Composition et entretien
              </summary>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted">
                Matières sélectionnées pour leur douceur et leur tenue. Lavage à la main recommandé, à froid, sans
                assouplissant.
              </p>
            </details>
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between text-xs uppercase tracking-[0.1em] text-ink">
                Livraison et retours
              </summary>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted">
                Livraison offerte dès [montant] €. Retours gratuits sous 30 jours.
              </p>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-border pt-12 lg:mt-20">
          <h2 className="mb-8 font-display text-2xl text-ink">Vous aimerez aussi</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
