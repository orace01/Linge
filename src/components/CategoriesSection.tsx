import { Link } from 'react-router-dom'
import { categories } from '../data/catalog'
import { ArrowRightIcon } from './icons'
import { Reveal } from './Reveal'

export function CategoriesSection() {
  return (
    <section className="tex-silk px-5 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <p className="font-ui text-xs uppercase tracking-[0.22em] text-wine">L'index</p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">Nos catégories</h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink">
            Cinq familles de pièces, pensées pour se porter seules ou se répondre.
          </p>
        </Reveal>

        <ul className="border-t border-champagne lg:col-span-8">
          {categories.map((cat, i) => (
            <li key={cat.slug} className="border-b border-champagne">
              <Reveal delay={i * 90}>
                <Link to={`/collection/${cat.slug}`} className="group flex items-baseline gap-5 py-5 sm:gap-8 sm:py-6">
                  <span className="font-display text-sm italic text-wine">0{i + 1}</span>
                  <span className="font-display text-3xl text-ink transition duration-500 group-hover:translate-x-2 group-hover:italic group-hover:text-wine sm:text-5xl">
                    {cat.name}
                  </span>
                  <ArrowRightIcon className="ml-auto h-5 w-5 shrink-0 -translate-x-2 self-center text-wine opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
