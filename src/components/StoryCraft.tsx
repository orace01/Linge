import { Link } from 'react-router-dom'
import { EmptyFrame } from './EmptyFrame'
import { ArrowRightIcon } from './icons'

export function StoryCraft() {
  return (
    <section className="bg-ivory px-5 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 sm:grid-cols-2 sm:gap-14">
        <EmptyFrame ratio="4 / 5" tone="light" className="w-full" rounded="rounded-[28px]" />
        <div>
          <span className="text-[11px] uppercase tracking-[0.16em] text-raspberry">Savoir-faire</span>
          <h2 className="mt-3 font-display text-3xl leading-tight text-plum sm:text-4xl">
            Confort, matières et coupe au service de la silhouette
          </h2>
          <p className="mt-4 max-w-md text-sm font-light leading-relaxed plum-soft">
            Chaque pièce est pensée dans le détail : matières sélectionnées pour leur toucher, coupes ajustées pièce
            par pièce, finitions soignées. Un savoir-faire discret, au service du confort.
          </p>
          <Link
            to="/notre-histoire"
            className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-plum px-6 py-3 text-[11px] font-medium uppercase tracking-widest text-ivory transition hover:bg-plum/90"
          >
            Notre histoire
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
