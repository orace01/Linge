import { Link } from 'react-router-dom'
import { categories } from '../data/catalog'
import { EmptyFrame } from './EmptyFrame'
import { ArrowRightIcon } from './icons'

export function CategoriesSection() {
  return (
    <section className="bg-surface-soft px-5 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Nos catégories</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/collection/${cat.slug}`} className="group block">
              <EmptyFrame ratio={cat.frameRatio} className="w-full" />
              <div className="mt-3 flex items-center justify-between">
                <p className="font-display text-base text-ink">{cat.name}</p>
                <ArrowRightIcon className="h-3.5 w-3.5 text-rose transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
