import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../brand'

/*
  Scroll-driven hero. The section is taller than the screen and its inner
  frame is sticky: while the frame is pinned, scrolling down brings each next
  slide up over the previous one (which recedes slightly), scrolling up
  reverses it; after the last slide the page scrolls on normally.

  Desktop: each slide is the 1344 × 768 mock-up scaled by --s (see index.css),
  sliding under the (transparent) header; the frame fills the screen and the wide
  images carry extra wall below the mock-up for windows taller than 7:4.
  Below lg the frame fills the screen and the text sits on the photo over a
  dark gradient.
*/

type Slide = {
  image: string
  alt: string
  eyebrow: string
  title: [string, string]
  text: string
  cta: { label: string; to: string }
}

const slides: Slide[] = [
  {
    image: 'slide-1',
    alt: 'Mannequin en ensemble de dentelle noire et kimono en satin, devant une rose en papier rouge géante',
    eyebrow: 'Série N° 01',
    title: ['Seconde peau,', 'premier rôle.'],
    text: "Le confort n'a pas à passer inaperçu.",
    cta: { label: 'Découvrir la collection', to: '/boutique' },
  },
  {
    image: 'slide-2',
    alt: 'Mannequin en ensemble de satin ivoire et dentelle vin, kimono en satin vin, devant une rose en papier',
    eyebrow: 'Série N° 02',
    title: ['Satin ivoire,', 'dentelle vin.'],
    text: "La douceur du satin, l'audace de la dentelle.",
    cta: { label: 'Découvrir les ensembles', to: '/collection/ensembles' },
  },
  {
    image: 'slide-3',
    alt: 'Mannequin en ensemble de satin champagne et kimono anthracite, devant une rose en papier noire',
    eyebrow: 'Série N° 03',
    title: ["L'or", 'de la nuit.'],
    text: 'Satin champagne et kimono anthracite, pour les heures tardives.',
    cta: { label: 'Voir la lingerie de nuit', to: '/collection/lingerie-de-nuit' },
  },
  {
    image: 'slide-4',
    alt: 'Mannequin en body de dentelle prune, devant une rose en papier violette',
    eyebrow: 'Série N° 04',
    title: ['Tout en', 'transparence.'],
    text: 'Un body en dentelle prune qui dessine sans contraindre.',
    cta: { label: 'Découvrir les bodys', to: '/collection/bodys' },
  },
]

const count = slides.length

/** 0 → 1 over the middle of a transition, so each slide holds a moment fully visible. */
function ease(t: number) {
  const x = Math.min(1, Math.max(0, (t - 0.12) / 0.76))
  return x * x * (3 - 2 * x)
}

const rise = (ms: number) => ({ '--rise-delay': `${ms}ms` }) as CSSProperties

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([])
  const [current, setCurrent] = useState(0)

  /** Where the pinned frame is in the section: how far it has travelled and how far it can. */
  const measure = () => {
    const section = sectionRef.current!
    const frame = frameRef.current!
    const scrollable = section.offsetHeight - frame.offsetHeight
    const pinnedAt = parseFloat(getComputedStyle(frame).top) || 0
    return { scrollable, progressed: pinnedAt - section.getBoundingClientRect().top }
  }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf = 0

    const update = () => {
      raf = 0
      const { scrollable, progressed } = measure()
      const f = scrollable > 0 ? Math.min(1, Math.max(0, progressed / scrollable)) * (count - 1) : 0

      for (let i = 0; i < count; i++) {
        const slide = slideRefs.current[i]
        const shade = shadeRefs.current[i]
        if (!slide || !shade) continue
        const move = i === 0 ? 1 : ease(f - (i - 1)) // how far this slide has come in
        const covered = i < count - 1 ? ease(f - i) : 0 // how far the next one covers it
        if (reduced.matches) {
          slide.style.transform = ''
          slide.style.opacity = String(move)
        } else {
          slide.style.opacity = ''
          slide.style.transform = `translate3d(0, ${(1 - move) * 100}%, 0) scale(${1 - covered * 0.06})`
        }
        slide.style.visibility = move > 0 ? 'visible' : 'hidden'
        shade.style.opacity = String(covered * 0.45)
      }
      setCurrent(Math.min(count - 1, Math.max(0, Math.round(f))))
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    reduced.addEventListener('change', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      reduced.removeEventListener('change', onScroll)
    }
  }, [])

  /** Scroll the page to the position where slide `i` is fully shown. */
  const showSlide = (i: number) => {
    const { scrollable, progressed } = measure()
    const target = (scrollable * i) / (count - 1)
    window.scrollTo({ top: window.scrollY + target - progressed, behavior: 'smooth' })
  }

  return (
    <section
      id="top"
      ref={sectionRef}
      aria-label={`Les collections ${BRAND}`}
      className="relative -mt-[var(--header-h)] [--hero-h:100svh] [--hero-step:85svh] lg:[--hero-h:max(calc(768*var(--s)),100svh)]"
      style={{ height: `calc(var(--hero-h) + ${count - 1} * var(--hero-step))` }}
    >
      <div ref={frameRef} className="sticky top-0 h-[var(--hero-h)] overflow-hidden bg-wine">
        {slides.map((slide, i) => {
          const Title = i === 0 ? 'h1' : 'h2'
          const isCurrent = i === current
          return (
            <div
              key={slide.image}
              ref={(el) => {
                slideRefs.current[i] = el
              }}
              aria-hidden={!isCurrent}
              inert={!isCurrent}
              className="absolute inset-0 origin-top will-change-transform"
              style={{ zIndex: i + 1, visibility: i === 0 ? 'visible' : 'hidden' }}
            >
              <div className={`absolute inset-0 ${i === 0 ? 'hero-kenburns' : ''}`}>
                <picture>
                  <source media="(min-width: 1024px)" srcSet={`/hero/${slide.image}-wide.webp`} width={3520} height={1597} />
                  <img
                    src={`/hero/${slide.image}.webp`}
                    alt={slide.alt}
                    width={1920}
                    height={1097}
                    fetchPriority={i === 0 ? 'high' : 'low'}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-[76%_30%] sm:object-[62%_40%] lg:bottom-auto lg:left-1/2 lg:right-auto lg:h-[calc(1118*var(--s))] lg:w-auto lg:max-w-none lg:-translate-x-1/2"
                  />
                </picture>
              </div>

              {/* mobile: dark gradient under the text */}
              <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-ink/90 via-ink/45 to-transparent lg:hidden" />

              <div className="absolute inset-0 lg:mx-auto lg:w-[min(100%,calc(1344*var(--s)))]">
                <div className="absolute inset-x-0 bottom-0 px-5 pb-10 sm:px-10 lg:inset-x-auto lg:bottom-auto lg:left-[calc(101*var(--s))] lg:top-[calc(306.8*var(--s))] lg:p-0">
                  <p
                    style={rise(250)}
                    className={`${i === 0 ? 'hero-rise' : ''} font-ui text-[12px] uppercase leading-none tracking-[0.06em] text-surface/90 lg:text-[length:calc(16.8*var(--s))] lg:text-surface lg:tracking-[0.03em]`}
                  >
                    {BRAND} · {slide.eyebrow}
                  </p>
                  <Title
                    style={rise(400)}
                    className={`${i === 0 ? 'hero-rise' : ''} mt-3 font-title text-[34px] font-bold uppercase leading-[1.08] text-surface sm:text-[48px] lg:mt-[calc(11.9*var(--s))] lg:text-[length:calc(50.5*var(--s))] lg:leading-[calc(59*var(--s))]`}
                  >
                    {slide.title[0]}
                    <br />
                    {slide.title[1]}
                  </Title>
                  <p
                    style={rise(560)}
                    className={`${i === 0 ? 'hero-rise' : ''} mt-3 max-w-md font-ui text-[16px] leading-snug text-surface/90 sm:text-[19px] lg:mt-[calc(19.6*var(--s))] lg:max-w-none lg:text-[length:calc(22.5*var(--s))] lg:leading-none lg:text-surface`}
                  >
                    {slide.text}
                  </p>
                  <Link
                    to={slide.cta.to}
                    style={rise(720)}
                    className={`${i === 0 ? 'hero-rise' : ''} mt-6 inline-flex h-12 items-center rounded-[6px] bg-wine px-6 font-ui text-[14px] font-medium uppercase leading-none text-surface transition hover:bg-wine-hover lg:mt-[calc(31.4*var(--s))] lg:h-[calc(50.5*var(--s))] lg:rounded-[calc(6*var(--s))] lg:px-[calc(20*var(--s))] lg:text-[length:calc(19.5*var(--s))]`}
                  >
                    {slide.cta.label}
                  </Link>
                </div>
              </div>

              {/* darkens this slide while the next one covers it */}
              <div
                ref={(el) => {
                  shadeRefs.current[i] = el
                }}
                className="pointer-events-none absolute inset-0 bg-black opacity-0"
              />
            </div>
          )
        })}

        {/* position in the series */}
        <div className="absolute inset-y-0 right-0 z-30 flex items-center pr-3 lg:right-[max(0px,calc((100%-1344*var(--s))/2))] lg:pr-[calc(40*var(--s))]">
          <nav aria-label="Séries du hero" className="flex flex-col items-end gap-1">
            {slides.map((slide, i) => (
              <button
                key={slide.image}
                onClick={() => showSlide(i)}
                aria-label={`Afficher la série N° 0${i + 1}`}
                aria-current={i === current ? 'true' : undefined}
                className="group flex items-center gap-2 py-1.5 text-surface"
              >
                <span
                  className={`font-display text-xs italic transition ${
                    i === current ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
                  }`}
                >
                  0{i + 1}
                </span>
                <span
                  className={`block w-[2px] rounded-full bg-surface transition-all duration-500 ${
                    i === current ? 'h-9 opacity-100' : 'h-4 opacity-45 group-hover:opacity-80'
                  }`}
                />
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  )
}
