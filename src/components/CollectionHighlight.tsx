import { Link } from 'react-router-dom'
import { EmptyFrame } from './EmptyFrame'
import { ArrowRightIcon } from './icons'

export function CollectionHighlight() {
  return (
    <section className="bg-page px-5 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <EmptyFrame ratio="16 / 9" className="w-full" rounded="rounded-[28px]" />
        <div className="mt-8 flex flex-col items-start gap-4 sm:max-w-xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">L'essentiel, tout simplement</h2>
          <p className="text-sm font-light leading-relaxed text-ink-muted">
            Une sélection resserrée de pièces intemporelles, pensées pour durer saison après saison.
          </p>
          <Link
            to="/boutique"
            className="flex items-center gap-2.5 rounded-full bg-wine px-6 py-3 text-[11px] font-medium uppercase tracking-widest text-surface transition hover:bg-wine-hover"
          >
            Découvrir
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
