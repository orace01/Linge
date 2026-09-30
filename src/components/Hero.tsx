import { Link } from 'react-router-dom'
import { BRAND } from '../brand'

/*
  Desktop: the hero slides under the top band + header and is exactly the
  1344 × 768 mock-up scaled by --s (see index.css), so it always fits the
  window. The wide image carries extra wall on both sides for windows wider
  than the mock-up. Below lg the photo and the text are stacked.
*/
export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#852b28] lg:-mt-[calc(var(--strip-h)+var(--header-h))] lg:h-[calc(768*var(--s))]"
    >
      <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
        <picture>
          <source media="(min-width: 1024px)" srcSet="/hero/lucea-hero-wide.webp" width={3520} height={1097} />
          <img
            src="/hero/lucea-hero.webp"
            alt="Mannequin en ensemble de dentelle noire et kimono en satin, devant une rose en papier géante"
            width={1920}
            height={1097}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[78%_50%] sm:object-[60%_50%] lg:left-1/2 lg:right-auto lg:w-auto lg:max-w-none lg:-translate-x-1/2"
          />
        </picture>
      </div>

      <div className="relative lg:mx-auto lg:h-full lg:w-[min(100%,calc(1344*var(--s)))]">
        <div className="px-5 pb-12 pt-8 sm:px-10 lg:absolute lg:left-[calc(101*var(--s))] lg:top-[calc(306.8*var(--s))] lg:p-0">
          <p className="font-ui text-[12px] uppercase leading-none tracking-[0.06em] text-[#fff2e6] lg:text-[length:calc(16.8*var(--s))] lg:tracking-[0.03em]">
            {BRAND} · Série N° 01
          </p>
          <h1 className="mt-4 font-title text-[36px] font-bold uppercase leading-[1.1] text-[#fff4d8] sm:text-[50px] lg:mt-[calc(11.9*var(--s))] lg:text-[length:calc(50.5*var(--s))] lg:leading-[calc(59*var(--s))]">
            Seconde peau,
            <br />
            premier rôle.
          </h1>
          <p className="mt-4 font-ui text-[17px] leading-snug text-[#fff2e6] sm:text-[20px] lg:mt-[calc(19.6*var(--s))] lg:text-[length:calc(22.5*var(--s))] lg:leading-none">
            Le confort n'a pas à passer inaperçu.
          </p>
          <Link
            to="/boutique"
            className="mt-7 inline-flex h-12 items-center rounded-[6px] bg-aubergine px-6 font-ui text-[14px] font-medium uppercase leading-none text-[#fff2ec] transition hover:bg-[#5a2147] lg:mt-[calc(31.4*var(--s))] lg:h-[calc(50.5*var(--s))] lg:rounded-[calc(6*var(--s))] lg:px-[calc(20*var(--s))] lg:text-[length:calc(19.5*var(--s))]"
          >
            Découvrir la collection
          </Link>
        </div>
      </div>
    </section>
  )
}
