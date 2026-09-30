import { Link } from 'react-router-dom'
import { FabricMedia } from './FabricMedia'
import { Reveal } from './Reveal'

function Caption({ numeral, title, text }: { numeral?: string; title: string; text: string }) {
  return (
    <figcaption className="mt-3">
      <p className="font-display text-lg text-ink">
        {numeral && <span className="mr-2 italic text-wine">{numeral}</span>}
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{text}</p>
    </figcaption>
  )
}

/** The collection told as a moodboard: campaign portrait, lace detail, moving silk, the rose. */
export function CollectionStory() {
  return (
    <section className="relative overflow-hidden bg-page px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-8">
        {/* title + the rose */}
        <div className="flex flex-col gap-14 lg:col-span-5">
          <Reveal>
            <p className="font-ui text-xs uppercase tracking-[0.22em] text-wine">Série N° 01</p>
            <h2 className="mt-7">
              <span className="block font-script text-[64px] leading-[1.1] text-wine sm:text-[92px]">la Collection</span>
              <span className="-mt-1 block font-display text-5xl uppercase leading-none tracking-[0.03em] text-ink sm:text-7xl">
                Seconde Peau
              </span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-muted">
              Trois matières, une seule histoire : une lingerie qui se porte comme une seconde peau et se remarque
              comme un premier rôle.
            </p>
            <Link
              to="/boutique"
              className="mt-8 inline-flex items-center rounded-full bg-wine px-7 py-3.5 text-[11px] font-medium uppercase tracking-widest text-surface transition hover:bg-wine-hover"
            >
              Explorer la collection
            </Link>
          </Reveal>

          <Reveal delay={200} className="mx-auto w-full max-w-[280px] lg:ml-auto lg:mr-6 lg:max-w-[320px]">
            <figure>
              <div className="overflow-hidden rounded-full">
                <img
                  src="/campaign/rose.webp"
                  alt="Gros plan sur la rose en papier de la campagne"
                  width={380}
                  height={380}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition duration-[2000ms] ease-out hover:scale-[1.06] motion-safe:hover:rotate-3"
                />
              </div>
              <Caption numeral="III" title="La rose" text="Le fil rouge de la Série N° 01." />
            </figure>
          </Reveal>
        </div>

        {/* campaign portrait */}
        <Reveal className="lg:col-span-4 lg:mt-16" delay={120}>
          <figure>
            <div className="overflow-hidden rounded-[28px]">
              <img
                src="/campaign/portrait.webp"
                alt="Mannequin de la campagne Série N° 01, kimono en satin noir sur un ensemble en dentelle"
                width={430}
                height={696}
                loading="lazy"
                className="aspect-[430/696] w-full object-cover transition duration-[2000ms] ease-out hover:scale-[1.04]"
              />
            </div>
            <Caption title="La campagne" text="Série N° 01, photographiée sur fond de papier rouge." />
          </figure>
        </Reveal>

        {/* details: lace + moving silk */}
        <div className="grid grid-cols-2 gap-5 lg:col-span-3 lg:mt-32 lg:grid-cols-1 lg:gap-12">
          <Reveal delay={240}>
            <figure>
              <div className="overflow-hidden rounded-[20px]">
                <img
                  src="/lucea/10-matiere-dentelle.webp"
                  alt="Gros plan sur une dentelle florale noire brodée de fleurs roses, posée sur du satin"
                  width={1248}
                  height={832}
                  loading="lazy"
                  className="aspect-[3/2] w-full object-cover transition duration-[2000ms] ease-out hover:scale-[1.06]"
                />
              </div>
              <Caption numeral="I" title="La dentelle" text="Des motifs floraux, légers sur la peau." />
            </figure>
          </Reveal>
          <Reveal delay={360}>
            <figure>
              <FabricMedia colorway="rose" motion="inview" className="aspect-[4/5] rounded-[20px]" />
              <Caption numeral="II" title="La soie" text="Un tombé fluide qui suit chaque geste." />
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
