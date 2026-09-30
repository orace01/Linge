import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { colorwayOf, findVariant, getProductBySlug, products, type Product as ProductType } from '../data/catalog'
import { FabricMedia } from '../components/FabricMedia'
import { ProductCard } from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useStock } from '../context/StockContext'
import { HeartIcon } from '../components/icons'
import { availableQty, deliveryEstimate, type StockLevel } from '../lib/stock'
import { formatPrice } from '../lib/format'

type LevelOf = (vid: string | undefined) => StockLevel | null

/** first size of `color` that is not sold out (or simply the first one when stock is unknown) */
function firstAvailableSize(product: ProductType, color: string, level: LevelOf) {
  const sizes = product.sizes.filter((s) => findVariant(product, color, s))
  return sizes.find((s) => level(findVariant(product, color, s)?.vid) !== 'out') ?? sizes[0] ?? ''
}

export function Product() {
  const { slug } = useParams<{ slug: string }>()
  // a fresh page per product: colour, size and photo choices do not leak between products
  return <ProductPage key={slug} slug={slug} />
}

function ProductPage({ slug }: { slug: string | undefined }) {
  const product = slug ? getProductBySlug(slug) : undefined
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { variant: variantStock, level, snapshot } = useStock()

  const [color, setColor] = useState(product?.colors[0] ?? '')
  const [chosenSize, setChosenSize] = useState<string | null>(null)
  const [imageIndex, setImageIndex] = useState(0)
  const [added, setAdded] = useState(false)
  const [galleryHover, setGalleryHover] = useState(false)

  if (!product) return <Navigate to="/boutique" replace />

  const size = chosenSize && findVariant(product, color, chosenSize) ? chosenSize : firstAvailableSize(product, color, level)
  const current = findVariant(product, color, size)
  const currentStock = variantStock(current?.vid)
  const currentLevel = level(current?.vid)
  const soldOut = currentLevel === 'out' || !current

  const images = product.images ?? (product.image ? [product.image] : [])
  const colorImage = product.variants.find((v) => v.color === color && v.image)?.image
  const mainImage = images[imageIndex] ?? colorImage ?? images[0]

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3)
  const fav = isFavorite(product.slug)

  const chooseColor = (c: string) => {
    setColor(c)
    const img = product.variants.find((v) => v.color === c && v.image)?.image
    const index = img ? images.indexOf(img) : -1
    if (index >= 0) setImageIndex(index)
  }

  const handleAdd = () => {
    if (soldOut) return
    addItem({ slug: product.slug, color, size, quantity: 1 })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  const zoomClass = `h-full w-full object-cover transition-transform duration-[1800ms] ease-out ${
    galleryHover ? 'motion-safe:scale-[1.07]' : ''
  }`

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
            {mainImage ? (
              <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-surface-soft">
                <img src={mainImage} alt={`${product.name}, coloris ${color}`} className={zoomClass} />
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

          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setImageIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`shrink-0 overflow-hidden rounded-xl ring-offset-2 ring-offset-page transition ${
                    src === mainImage ? 'ring-2 ring-wine' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="aspect-[3/4] w-20 object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* fabric swatches when there is no photo at all */}
          {!images.length && (
            <div className="mt-4 flex gap-4">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => chooseColor(c)}
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
          <p className="mt-4 text-xl text-ink">{formatPrice(product.price)}</p>
          <p className="mt-6 max-w-lg whitespace-pre-line text-sm font-light leading-relaxed text-ink-muted">
            {product.description ??
              (product.cut
                ? `Coupe ${product.cut.toLowerCase()}, pensée pour un maintien confortable et une silhouette sculptée.`
                : 'Une pièce pensée pour un maintien confortable et une silhouette sculptée.')}
          </p>

          <div className="mt-8">
            <span className="text-[11px] uppercase tracking-[0.1em] text-ink-muted">Couleur — {color}</span>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {product.colors.map((c) => {
                const allOut =
                  snapshot !== null &&
                  product.variants.filter((v) => v.color === c).every((v) => level(v.vid) === 'out')
                return (
                  <button
                    key={c}
                    onClick={() => chooseColor(c)}
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                      c === color ? 'border-wine bg-wine text-surface' : 'border-border text-ink hover:border-wine'
                    } ${allOut ? 'opacity-50' : ''}`}
                  >
                    {c}
                    {allOut && <span className="sr-only"> (épuisé)</span>}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.1em] text-ink-muted">Taille</span>
              <Link to="/guide-des-tailles" className="text-[11px] uppercase tracking-[0.1em] text-wine underline">
                Guide des tailles
              </Link>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {product.sizes.map((s) => {
                const v = findVariant(product, color, s)
                if (!v) return null
                const out = level(v.vid) === 'out'
                return (
                  <button
                    key={s}
                    onClick={() => setChosenSize(s)}
                    disabled={out}
                    aria-label={out ? `${s}, épuisé` : s}
                    className={`flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm transition ${
                      s === size ? 'bg-wine text-surface' : 'border border-border text-ink hover:border-wine'
                    } disabled:cursor-not-allowed disabled:border-border disabled:text-ink-muted disabled:line-through disabled:opacity-60`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <p
            className={`mt-6 text-xs ${
              currentLevel === 'out' ? 'text-error' : currentLevel === null ? 'text-ink-muted' : 'text-success'
            }`}
          >
            {currentLevel === 'out' && '○ Épuisé dans cette taille'}
            {currentLevel === 'low' && `● Plus que ${availableQty(currentStock)} en stock · livraison estimée ${deliveryEstimate(currentStock)}`}
            {currentLevel === 'in' && `● En stock · livraison estimée ${deliveryEstimate(currentStock)}`}
            {currentLevel === null && `Livraison estimée ${deliveryEstimate(currentStock)}`}
          </p>

          <button
            onClick={handleAdd}
            disabled={soldOut}
            className="mt-5 w-full rounded-full bg-wine py-4 text-xs font-medium uppercase tracking-widest text-surface transition hover:bg-wine-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-12"
          >
            {soldOut ? 'Épuisé' : added ? 'Ajouté au panier ✓' : 'Ajouter au panier'}
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
                Livraison suivie ; le délai estimé est indiqué au-dessus du bouton d'ajout au panier, selon l'entrepôt
                d'expédition de la pièce. Retours sous 30 jours.
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
