import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { BRAND } from '../brand'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from './icons'

/*
  Desktop: the hero slides under the top band + header and is exactly the
  1344 × 768 mock-up scaled by --s (see index.css), so it always fits the
  window. Each wide image carries extra wall on both sides for windows wider
  than the mock-up. Below lg the photo and the text are stacked, the text on
  the page background (the hero colours stay in the photos).

  Carousel: slides are stacked in one grid cell; only the active slide and the
  one leaving are visible, each moved by a CSS animation. Autoplay is driven by
  the progress bar's animation, so pausing the bar pauses the carousel.
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

const SLIDE_MS = 6500
const count = slides.length

type Direction = 'next' | 'prev'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

const rise = (ms: number) => ({ '--rise-delay': `${ms}ms` }) as CSSProperties

export function Hero() {
  const [state, setState] = useState<{ index: number; leaving: number | null; dir: Direction }>({
    index: 0,
    leaving: null,
    dir: 'next',
  })
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const reduced = usePrefersReducedMotion()
  const touchX = useRef<number | null>(null)

  const running = !paused && !hovered && !focused && !reduced
  const { index, leaving, dir } = state

  const goTo = (target: number, direction: Direction) => {
    const next = (target + count) % count
    setState((s) => (next === s.index ? s : { index: next, leaving: s.index, dir: direction }))
  }
  const next = () => goTo(index + 1, 'next')
  const prev = () => goTo(index - 1, 'prev')

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') touchX.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (touchX.current === null) return
    const dx = e.clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) > 50) {
      if (dx < 0) next()
      else prev()
    }
  }

  return (
    <section
      id="top"
      aria-roledescription="carrousel"
      aria-label="Les collections Lucea"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => {
        // keyboard users get a still carousel; a mouse click on a control must not pause it
        if (e.target.matches(':focus-visible')) setFocused(true)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (touchX.current = null)}
      className="relative touch-pan-y overflow-hidden bg-page lg:-mt-[calc(var(--strip-h)+var(--header-h))] lg:h-[calc(768*var(--s))] lg:bg-wine"
    >
      <div className="grid lg:h-full" aria-live={running ? 'off' : 'polite'}>
        {slides.map((slide, i) => {
          const active = i === index
          const isLeaving = i === leaving
          const shown = active || isLeaving
          const motion = active ? (leaving !== null ? `hero-in-${dir}` : '') : isLeaving ? `hero-out-${dir}` : ''
          const Title = i === 0 ? 'h1' : 'h2'
          return (
            <div
              key={slide.image}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${i + 1} sur ${count}`}
              aria-hidden={!active}
              inert={!active}
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget && isLeaving) setState((s) => ({ ...s, leaving: null }))
              }}
              className={`relative bg-page [grid-area:1/1] lg:h-full lg:bg-transparent ${active ? 'z-20' : 'z-10'} ${
                shown ? '' : 'invisible'
              } ${motion}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto">
                <div className={`absolute inset-0 ${shown ? 'hero-kenburns' : ''}`}>
                  <picture>
                    <source
                      media="(min-width: 1024px)"
                      srcSet={`/hero/${slide.image}-wide.webp`}
                      width={3520}
                      height={1097}
                    />
                    <img
                      src={`/hero/${slide.image}.webp`}
                      alt={slide.alt}
                      width={1920}
                      height={1097}
                      fetchPriority={i === 0 ? 'high' : 'low'}
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-[78%_50%] sm:object-[60%_50%] lg:left-1/2 lg:right-auto lg:w-auto lg:max-w-none lg:-translate-x-1/2"
                    />
                  </picture>
                </div>
              </div>

              <div className="relative lg:mx-auto lg:h-full lg:w-[min(100%,calc(1344*var(--s)))]">
                <div className="px-5 pb-12 pt-8 lg:absolute lg:left-[calc(101*var(--s))] lg:top-[calc(306.8*var(--s))] lg:p-0">
                  <p
                    style={rise(250)}
                    className={`${shown ? 'hero-rise' : ''} font-ui text-[12px] uppercase leading-none tracking-[0.06em] text-wine lg:text-[length:calc(16.8*var(--s))] lg:text-surface lg:tracking-[0.03em]`}
                  >
                    {BRAND} · {slide.eyebrow}
                  </p>
                  <Title
                    style={rise(400)}
                    className={`${shown ? 'hero-rise' : ''} mt-4 font-title text-[36px] font-bold uppercase leading-[1.1] text-ink sm:text-[50px] lg:text-surface lg:mt-[calc(11.9*var(--s))] lg:text-[length:calc(50.5*var(--s))] lg:leading-[calc(59*var(--s))]`}
                  >
                    {slide.title[0]}
                    <br />
                    {slide.title[1]}
                  </Title>
                  <p
                    style={rise(560)}
                    className={`${shown ? 'hero-rise' : ''} mt-4 font-ui text-[17px] leading-snug text-ink-muted sm:text-[20px] lg:text-surface lg:mt-[calc(19.6*var(--s))] lg:text-[length:calc(22.5*var(--s))] lg:leading-none`}
                  >
                    {slide.text}
                  </p>
                  <Link
                    to={slide.cta.to}
                    style={rise(720)}
                    className={`${shown ? 'hero-rise' : ''} mt-7 inline-flex h-12 items-center rounded-[6px] bg-wine px-6 font-ui text-[14px] font-medium uppercase leading-none text-surface transition hover:bg-wine-hover lg:mt-[calc(31.4*var(--s))] lg:h-[calc(50.5*var(--s))] lg:rounded-[calc(6*var(--s))] lg:px-[calc(20*var(--s))] lg:text-[length:calc(19.5*var(--s))]`}
                  >
                    {slide.cta.label}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* controls: over the photo's bottom edge on mobile, under the button on desktop */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(125vw-4rem)] z-30 px-5 sm:top-[calc(62.5vw-4rem)] lg:inset-y-0 lg:top-0 lg:mx-auto lg:w-[min(100%,calc(1344*var(--s)))] lg:px-0">
        <div className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-ink/45 p-1 text-surface backdrop-blur-md lg:absolute lg:left-[calc(101*var(--s))] lg:top-[calc(612*var(--s))] lg:gap-[calc(4*var(--s))] lg:p-[calc(4*var(--s))]">
          <button
            onClick={prev}
            aria-label="Diapositive précédente"
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-surface/15 lg:h-[calc(34*var(--s))] lg:w-[calc(34*var(--s))]"
          >
            <ChevronLeftIcon size={18} stroke={2} />
          </button>

          <div className="flex items-center gap-1.5 px-1">
            {slides.map((slide, i) => (
              <button
                key={slide.image}
                onClick={() => goTo(i, i > index ? 'next' : 'prev')}
                aria-label={`Aller à la diapositive ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className="group flex h-8 items-center px-0.5 lg:h-[calc(34*var(--s))]"
              >
                <span className="relative block h-[3px] w-7 overflow-hidden rounded-full bg-surface/35 lg:w-[calc(34*var(--s))]">
                  {i === index && (
                    <span
                      key={`${index}-${reduced}`}
                      onAnimationEnd={next}
                      style={
                        {
                          '--hero-duration': `${SLIDE_MS}ms`,
                          animationPlayState: running ? 'running' : 'paused',
                        } as CSSProperties
                      }
                      className={`absolute inset-0 rounded-full bg-surface ${reduced ? '' : 'hero-progress'}`}
                    />
                  )}
                  {i !== index && <span className="absolute inset-0 rounded-full bg-surface/0 transition group-hover:bg-surface/40" />}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Diapositive suivante"
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-surface/15 lg:h-[calc(34*var(--s))] lg:w-[calc(34*var(--s))]"
          >
            <ChevronRightIcon size={18} stroke={2} />
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Relancer le défilement' : 'Mettre le défilement en pause'}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-surface/15 lg:h-[calc(34*var(--s))] lg:w-[calc(34*var(--s))]"
          >
            {paused ? <PlayIcon size={14} /> : <PauseIcon size={14} />}
          </button>
        </div>
      </div>
    </section>
  )
}
