const faqs = [
  { q: 'Quels sont les délais de livraison ?', a: 'Comptez 2 à 4 jours ouvrés en France métropolitaine, et 5 à 8 jours pour l’international.' },
  { q: 'Comment choisir ma taille ?', a: 'Consultez notre guide des tailles pour trouver la coupe la plus adaptée à votre silhouette.' },
  { q: 'Puis-je retourner un article ?', a: 'Oui, sous 30 jours à compter de la réception, dans son état d’origine.' },
  { q: 'Comment entretenir mes pièces ?', a: 'Un lavage à la main, à froid, est recommandé pour préserver les matières et les finitions.' },
]

export function FAQ() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-16 lg:py-24">
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-[0.16em] text-wine">Aide</span>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Questions fréquentes</h1>
      </div>

      <div className="mt-12 divide-y divide-border">
        {faqs.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer items-center justify-between font-display text-lg text-ink">
              {f.q}
            </summary>
            <p className="mt-3 text-sm font-light leading-relaxed text-ink-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
