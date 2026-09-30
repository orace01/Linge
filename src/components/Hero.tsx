import { Link } from 'react-router-dom'
import { ArrowRightIcon } from './icons'

export function Hero() {
  return (
    <section className="w-full bg-cream" id="top">
      {/* ===== desktop / tablet — layered composition ===== */}
      <div className="relative hidden overflow-hidden lg:block" style={{ height: '90vh' }}>
        {/* 1. decorative rose shape, centered */}
        <div
          className="absolute rounded-full bg-rose"
          style={{ left: '50%', top: '52%', height: '80vh', aspectRatio: '1 / 1', transform: 'translate(-50%, -50%)' }}
        />

        {/* 2. photo — one side only, natural cutout silhouette, behind the title */}
        <Link
          to="/boutique"
          aria-label="Découvrir la collection"
          className="absolute z-[5] block"
          style={{ right: '4%', bottom: 0, height: '92%' }}
        >
          <img
            src="/hero/seconde-peau.png"
            alt="Body Fleur de Nuit"
            className="h-full w-auto object-contain"
            style={{ filter: 'drop-shadow(0 30px 40px rgba(44,23,34,0.25))' }}
          />
        </Link>

        {/* 3. title — centered, in front of the photo */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-8">
          <span className="whitespace-nowrap font-headline text-[clamp(110px,20vw,330px)] uppercase leading-none tracking-tighter text-plum scale-y-[1.25]">
            Seconde Peau
          </span>
        </div>

        {/* 4. corner text — grouped on the left, clear of the photo */}
        <div className="absolute z-30 flex flex-col items-start gap-6" style={{ left: '6%', bottom: '7%', width: '30%' }}>
          <p className="font-display text-2xl italic leading-snug text-plum">
            « La lingerie comme une seconde peau »
          </p>
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm font-light leading-relaxed text-plum">
              Des matières choisies avec soin et des coupes pensées pour épouser chaque silhouette.
            </p>
            <Link
              to="/boutique"
              className="flex items-center gap-2.5 rounded-full bg-raspberry px-6 py-3.5 text-[11px] font-medium uppercase tracking-widest text-white transition hover:bg-raspberry-deep"
            >
              Découvrir la collection
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== mobile — stacked, no overlap ===== */}
      <div className="px-5 pb-12 pt-10 lg:hidden">
        <div className="flex flex-col items-center text-center">
          <span className="font-headline text-[26vw] uppercase leading-[0.92] tracking-tighter text-plum scale-y-[1.25]">
            Seconde
          </span>
          <span className="font-headline text-[26vw] uppercase leading-[0.92] tracking-tighter text-plum scale-y-[1.25]">
            Peau
          </span>
        </div>

        <div className="relative mt-6 flex justify-center" style={{ height: '48vh' }}>
          <div
            className="absolute rounded-full bg-rose"
            style={{ left: '50%', top: '50%', height: '92%', aspectRatio: '1 / 1', transform: 'translate(-50%, -50%)' }}
          />
          <Link to="/boutique" aria-label="Découvrir la collection" className="relative z-[1] block h-full">
            <img
              src="/hero/seconde-peau.png"
              alt="Body Fleur de Nuit"
              className="h-full w-auto object-contain"
              style={{ filter: 'drop-shadow(0 20px 26px rgba(44,23,34,0.25))' }}
            />
          </Link>
        </div>

        <p className="mt-10 text-center font-display text-xl italic leading-snug text-plum">
          « La lingerie comme une seconde peau »
        </p>

        <p className="mt-5 text-center text-sm font-light leading-relaxed text-plum">
          Des matières choisies avec soin et des coupes pensées pour épouser chaque silhouette.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            to="/boutique"
            className="flex items-center gap-2.5 rounded-full bg-raspberry px-6 py-3.5 text-[11px] font-medium uppercase tracking-widest text-white"
          >
            Découvrir la collection
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
