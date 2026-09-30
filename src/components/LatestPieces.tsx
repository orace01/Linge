import { useState } from 'react'
import { products } from '../data/catalog'
import { ProductCard } from './ProductCard'

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
    <section className="bg-bordeaux px-5 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`text-xs uppercase tracking-[0.16em] transition ${
                i === activeTab ? 'border-b border-raspberry pb-1.5 text-ivory' : 'text-ivory/50 hover:text-ivory/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <h2 className="mt-8 text-center font-display text-3xl text-ivory sm:text-5xl">Les dernières pièces</h2>

        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {filtered.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} tone="dark" />
          ))}
        </div>
      </div>
    </section>
  )
}
