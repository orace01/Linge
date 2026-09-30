import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../data/catalog'
import { ArrowRightIcon } from './icons'
import { Reveal } from './Reveal'

export function CategoriesSection() {
  const [active, setActive] = useState(0)

  return (
    <section className="tex-silk px-5 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-12 lg:gap-16">
        {/* preview of the hovered category (desktop) */}
        <Reveal className="hidden lg:col-span-5 lg:block">
          <figure className="relative mx-auto aspect-[4/5] max-w-[440px] overflow-hidden rounded-[28px] shadow-[0_30px_60px_-30px_rgb(51_34_43/0.45)]">
            {categories.map((cat, i) => (
              <img
                key={cat.slug}
                src={cat.image}
                alt=""
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-out ${
                  i === active ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'
                }`}
              />
            ))}
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent px-6 pb-5 pt-16 font-display text-2xl italic text-surface">
              {categories[active].name}
            </figcaption>
          </figure>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="font-ui text-xs uppercase tracking-[0.22em] text-wine">L'index</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">Nos catégories</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink">
              Cinq familles de pièces, pensées pour se porter seules ou se répondre.
            </p>
          </Reveal>

          <ul className="mt-10 border-t border-champagne">
            {categories.map((cat, i) => (
              <li key={cat.slug} className="border-b border-champagne">
                <Reveal delay={i * 90}>
                  <Link
                    to={`/collection/${cat.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className="group flex items-center gap-5 py-4 sm:gap-8 sm:py-5"
                  >
                    <span className="font-display text-sm italic text-wine">0{i + 1}</span>
                    <span className="font-display text-3xl text-ink transition duration-500 group-hover:translate-x-2 group-hover:italic group-hover:text-wine sm:text-5xl">
                      {cat.name}
                    </span>
                    <img
                      src={cat.image}
                      alt=""
                      loading="lazy"
                      className="ml-auto aspect-[4/5] w-14 shrink-0 rounded-lg object-cover lg:hidden"
                    />
                    <ArrowRightIcon className="ml-auto hidden h-5 w-5 shrink-0 -translate-x-2 text-wine opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100 lg:block" />
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
