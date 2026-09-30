import { Link } from 'react-router-dom'
import { EmptyFrame } from './EmptyFrame'

const articles = [
  { title: 'Guide des tailles', to: '/guide-des-tailles' },
  { title: 'Nos matières', to: '/nos-matieres' },
  { title: "Conseils d'entretien", to: '/entretien' },
  { title: 'Bien choisir sa lingerie', to: '/bien-choisir' },
]

export function EditorialMagazine() {
  return (
    <section className="bg-cream px-5 py-16 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="font-display text-3xl text-plum sm:text-4xl">Le journal</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {articles.map((a) => (
            <Link key={a.title} to={a.to} className="group block">
              <EmptyFrame ratio="4 / 5" tone="light" className="w-full" />
              <p className="mt-3 font-display text-base text-plum">{a.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
