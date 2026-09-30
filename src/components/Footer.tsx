import { Link } from 'react-router-dom'
import { BRAND } from '../brand'

const columns = [
  {
    title: 'Service client',
    links: [
      { label: 'Livraison et retours', to: '/livraison-retours' },
      { label: 'Guide des tailles', to: '/guide-des-tailles' },
      { label: 'Entretien des pièces', to: '/entretien' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'La maison',
    links: [
      { label: 'Notre histoire', to: '/notre-histoire' },
      { label: 'Journal', to: '/journal' },
      { label: 'Boutique', to: '/boutique' },
      { label: 'Mon compte', to: '/compte' },
      { label: 'Mes favoris', to: '/favoris' },
    ],
  },
]

const payments = ['Carte bancaire', 'PayPal', 'Apple Pay', '3x sans frais']
const socials = ['Instagram', 'Pinterest', 'TikTok']

export function Footer() {
  return (
    <footer className="tex-velvet-deep text-surface">
      <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] uppercase tracking-[0.14em] text-surface/60">{col.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-surface/80 transition hover:text-surface">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-surface/60">Réseaux sociaux</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {socials.map((s) => (
                <li key={s}>
                  <a href="#" className="text-surface/80 transition hover:text-surface">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-surface/60">Newsletter</p>
            <p className="mt-4 text-sm text-surface/70">Recevez nos nouveautés en avant-première.</p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex border-b border-surface/30 pb-2 transition focus-within:border-surface">
              <input
                type="email"
                required
                placeholder="Votre email"
                className="w-full bg-transparent text-sm placeholder:text-surface/50 focus:outline-none"
              />
              <button type="submit" className="text-xs uppercase tracking-widest text-surface transition hover:text-champagne">
                OK
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-surface/15 pt-6 text-xs text-surface/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND}. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {payments.map((p) => (
              <span key={p} className="rounded border border-surface/20 px-2.5 py-1 text-[10px] uppercase tracking-wide">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
