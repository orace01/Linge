export function NewsletterSection() {
  return (
    <section className="tex-silk px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <h2 className="font-display text-4xl text-ink sm:text-5xl">
          Restons <span className="italic">en contact</span>
        </h2>
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
