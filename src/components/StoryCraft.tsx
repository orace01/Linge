import { Link } from 'react-router-dom'
import { ArrowRightIcon } from './icons'
import { Reveal } from './Reveal'

export function StoryCraft() {
  return (
    <section className="tex-velvet-deep px-5 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 sm:gap-14 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <div className="overflow-hidden rounded-[28px]">
            <img
              src="/lucea/11-atelier-savoir-faire.webp"
              alt="Mains d'une couturière brodant une dentelle florale noire sur un tissu ivoire"
              width={1248}
              height={832}
              loading="lazy"
              className="aspect-[3/2] w-full object-cover transition duration-[2000ms] ease-out hover:scale-[1.04]"
            />
          </div>
        </Reveal>
        <Reveal delay={150}>
          <span className="text-[11px] uppercase tracking-[0.2em] text-surface/80">Savoir-faire</span>
          <h2 className="mt-3 font-display text-4xl leading-tight text-surface sm:text-5xl">
            Confort, matières et coupe <span className="italic">au service</span> de la silhouette
          </h2>
          <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-surface/85">
            Chaque pièce est pensée dans le détail : matières sélectionnées pour leur toucher, coupes ajustées pièce
            par pièce, finitions soignées. Un savoir-faire discret, au service du confort.
          </p>
          <Link
            to="/notre-histoire"
            className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-surface px-6 py-3 text-[11px] font-medium uppercase tracking-widest text-wine transition hover:bg-champagne hover:text-ink"
          >
            Notre histoire
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
