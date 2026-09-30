import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getCategoryBySlug, products } from '../data/catalog'
import { ProductCard } from '../components/ProductCard'
import { ChevronDownIcon } from '../components/icons'

const allSizes = ['XS', 'S', 'M', 'L']
const allColors = ['Rose poudré', 'Bordeaux', 'Prune', 'Ivoire']
const allCuts = Array.from(new Set(products.map((p) => p.cut)))

export function Collection() {
  const { slug } = useParams<{ slug?: string }>()
  const [searchParams] = useSearchParams()
  const activeCategory = slug ? getCategoryBySlug(slug) : undefined

  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [cut, setCut] = useState<string | null>(null)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const sortedByNew = searchParams.get('tri') === 'nouveautes'

  const filtered = useMemo(() => {
    let list = activeCategory ? products.filter((p) => p.category === activeCategory.name) : products
    if (size) list = list.filter((p) => p.sizes.includes(size))
    if (color) list = list.filter((p) => p.colors.includes(color))
    if (cut) list = list.filter((p) => p.cut === cut)
    if (inStockOnly) list = list.filter((p) => p.inStock)
    if (sortedByNew) list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew))
    return list
  }, [activeCategory, size, color, cut, inStockOnly, sortedByNew])

  const resetFilters = () => {
    setSize(null)
    setColor(null)
    setCut(null)
    setInStockOnly(false)
  }

  return (
    <div>
      <div className="bg-ivory px-5 py-14 text-center lg:py-20">
        <span className="text-[11px] uppercase tracking-[0.16em] text-raspberry">Collections</span>
        <h1 className="mt-3 font-display text-4xl text-plum sm:text-5xl">{activeCategory?.name ?? 'La boutique'}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed plum-soft">
          Une sélection de pièces pensées pour épouser chaque silhouette, du quotidien aux occasions.
        </p>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10">
        <div className="flex items-center justify-between border-b border-plum/10 pb-5">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-plum"
          >
            Filtres
            <ChevronDownIcon className={`h-3 w-3 transition ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
          <p className="text-xs plum-soft">{filtered.length} pièce{filtered.length > 1 ? 's' : ''}</p>
        </div>

        {filtersOpen && (
          <div className="flex flex-wrap gap-8 border-b border-plum/10 py-6">
            <div>
              <p className="mb-2.5 text-[11px] uppercase tracking-widest plum-soft">Taille</p>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(size === s ? null : s)}
                    className={`h-9 w-9 rounded-full text-xs transition ${
                      size === s ? 'bg-plum text-ivory' : 'border border-plum/20 text-plum'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-[11px] uppercase tracking-widest plum-soft">Couleur</p>
              <div className="flex flex-wrap gap-2">
                {allColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(color === c ? null : c)}
                    className={`rounded-full px-4 py-2 text-xs transition ${
                      color === c ? 'bg-plum text-ivory' : 'border border-plum/20 text-plum'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-[11px] uppercase tracking-widest plum-soft">Coupe</p>
              <div className="flex flex-wrap gap-2">
                {allCuts.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCut(cut === c ? null : c)}
                    className={`rounded-full px-4 py-2 text-xs transition ${
                      cut === c ? 'bg-plum text-ivory' : 'border border-plum/20 text-plum'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-[11px] uppercase tracking-widest plum-soft">Disponibilité</p>
              <button
                onClick={() => setInStockOnly((v) => !v)}
                className={`rounded-full px-4 py-2 text-xs transition ${
                  inStockOnly ? 'bg-plum text-ivory' : 'border border-plum/20 text-plum'
                }`}
              >
                En stock uniquement
              </button>
            </div>

            {(size || color || cut || inStockOnly) && (
              <button onClick={resetFilters} className="self-end text-xs uppercase tracking-widest text-raspberry">
                Réinitialiser
              </button>
            )}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-sm plum-soft">Aucune pièce ne correspond à ces filtres.</p>
        )}
      </div>
    </div>
  )
}
