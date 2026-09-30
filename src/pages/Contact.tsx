import { useState } from 'react'

export function Contact() {
  const [sent, setSent] = useState(false)

  return (
    <div className="mx-auto max-w-[560px] px-5 py-16 lg:py-24">
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-[0.16em] text-wine">Contact</span>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">Nous contacter</h1>
        <p className="mx-auto mt-5 max-w-sm text-sm font-light leading-relaxed text-ink-muted">
          Une question sur une commande, une taille ou une pièce ? Écrivez-nous.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
        className="mt-10 space-y-4"
      >
        <input required placeholder="Nom" className="input-field" />
        <input required type="email" placeholder="Email" className="input-field" />
        <textarea required placeholder="Votre message" rows={5} className="input-field resize-none" />
        <button
          type="submit"
          className="w-full rounded-full bg-wine py-3.5 text-xs font-medium uppercase tracking-widest text-surface transition hover:bg-wine-hover"
        >
          {sent ? 'Message envoyé ✓' : 'Envoyer'}
        </button>
      </form>
    </div>
  )
}
