import { useEffect, useRef, useState } from 'react'
import type { Colorway } from '../data/catalog'

type FabricMediaProps = {
  colorway: Colorway
  /** hover: the silk moves while `active`; inview: loops while on screen; still: image only */
  motion?: 'hover' | 'inview' | 'still'
  active?: boolean
  /** slow zoom while `active` */
  zoom?: boolean
  flip?: boolean
  alt?: string
  className?: string
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** A silk swatch that turns into a cinemagraph: the still is the first frame of the loop. */
export function FabricMedia({
  colorway,
  motion = 'hover',
  active = false,
  zoom = false,
  flip = false,
  alt = '',
  className = '',
}: FabricMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (motion !== 'inview' || !el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [motion])

  const shouldPlay = motion === 'inview' ? inView : motion === 'hover' && active

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (shouldPlay && !prefersReducedMotion()) video.play().catch(() => {})
    else video.pause()
  }, [shouldPlay])

  const src = `/textures/swatch-${colorway}`
  const flipClass = flip ? '-scale-x-100' : ''

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`absolute inset-0 transition-transform duration-[1800ms] ease-out ${
          zoom && active ? 'motion-safe:scale-[1.07]' : ''
        }`}
      >
        <img
          src={`${src}.webp`}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover ${flipClass}`}
        />
        {motion !== 'still' && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onPlaying={() => setLive(true)}
            onPause={() => setLive(false)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${flipClass} ${
              live ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={`${src}.webm`} type="video/webm" />
            <source src={`${src}.mp4`} type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  )
}
