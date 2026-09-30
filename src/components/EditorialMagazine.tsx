import { Link } from 'react-router-dom'
import { FabricMedia } from './FabricMedia'
import { Reveal } from './Reveal'

type Cover = { kind: 'fabric'; colorway: 'ivoire' | 'rose' | 'prune' } | { kind: 'image'; src: string }

const articles: { title: string; to: string; tag: string; cover: Cover }[] = [
  { title: 'Guide des tailles', to: '/guide-des-tailles', tag: 'Conseils', cover: { kind: 'fabric', colorway: 'ivoire' } },
  { title: 'Nos matières', to: '/nos-matieres', tag: 'Savoir-faire', cover: { kind: 'image', src: '/campaign/lace.webp' } },
  { title: "Conseils d'entretien", to: '/entretien', tag: 'Rituel', cover: { kind: 'fabric', colorway: 'rose' } },
  { title: 'Bien choisir sa lingerie', to: '/bien-choisir', tag: 'Conseils', cover: { kind: 'fabric', colorway: 'prune' } },
]

export function EditorialMagazine() {
  return (
    <section className="bg-page px-5 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <h2 className="font-display text-4xl text-ink sm:text-5xl">Le journal</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {articles.map((a, i) => (
            <Reveal key={a.title} delay={i * 110}>
              <Link to={a.to} className="group block">
                <div className="overflow-hidden rounded-2xl">
                  {a.cover.kind === 'fabric' ? (
                    <FabricMedia colorway={a.cover.colorway} motion="still" className="aspect-[4/5] transition duration-[1800ms] ease-out group-hover:scale-[1.05]" />
                  ) : (
                    <img
                      src={a.cover.src}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition duration-[1800ms] ease-out group-hover:scale-[1.05]"
                    />
                  )}
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-wine">{a.tag}</p>
                <p className="mt-1 font-display text-xl leading-snug text-ink transition group-hover:italic">{a.title}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
