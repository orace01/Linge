export function NewsletterSection() {
  return (
    <section className="bg-rose-soft px-5 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">Restons en contact</h2>
        <p className="mt-3 text-sm font-light leading-relaxed text-ink">
          Inscrivez-vous pour recevoir nos nouveautés, nos ventes privées et nos conseils lingerie.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex w-full max-w-sm gap-3">
          <input
            type="email"
            required
            placeholder="Votre adresse email"
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-focus focus:outline-none focus:ring-1 focus:ring-focus"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-wine px-6 py-3 text-[11px] font-medium uppercase tracking-widest text-surface transition hover:bg-wine-hover"
          >
            S'inscrire
          </button>
        </form>
      </div>
    </section>
  )
}
