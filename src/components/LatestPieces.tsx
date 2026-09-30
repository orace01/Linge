import { useState } from 'react'
import { products } from '../data/catalog'
import { ProductCard } from './ProductCard'
import { Reveal } from './Reveal'

const tabs = ['Nouveautés', 'Meilleures ventes', 'Coups de cœur']

export function LatestPieces() {
  const [activeTab, setActiveTab] = useState(0)

  const filtered =
    activeTab === 0
      ? products.filter((p) => p.isNew)
      : activeTab === 1
        ? products.filter((p) => p.isBestSeller)
        : products.slice(0, 4)

  return (
    <section className="bg-page px-5 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                  i === activeTab ? 'bg-wine text-surface' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <h2 className="mt-8 text-center font-display text-4xl text-ink sm:text-6xl">Les dernières pièces</h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {filtered.slice(0, 3).map((product, i) => (
            <Reveal key={`${activeTab}-${product.id}`} delay={i * 120}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
