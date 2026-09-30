import { Link } from 'react-router-dom'
import { Reveal } from './Reveal'

const articles = [
  { title: 'Guide des tailles', to: '/guide-des-tailles', tag: 'Conseils', cover: '/lucea/12-journal-guide-tailles.webp' },
  { title: 'Nos matières', to: '/nos-matieres', tag: 'Savoir-faire', cover: '/lucea/13-journal-matieres.webp' },
  { title: "Conseils d'entretien", to: '/entretien', tag: 'Rituel', cover: '/lucea/14-journal-entretien.webp' },
  { title: 'Bien choisir sa lingerie', to: '/bien-choisir', tag: 'Conseils', cover: '/lucea/15-journal-bien-choisir.webp' },
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
                  <img
                    src={a.cover}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition duration-[1800ms] ease-out group-hover:scale-[1.05]"
                  />
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
