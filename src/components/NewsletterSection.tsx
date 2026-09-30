export function NewsletterSection() {
  return (
    <section className="bg-rose px-5 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <h2 className="font-display text-3xl text-plum sm:text-4xl">Restons en contact</h2>
        <p className="mt-3 text-sm font-light leading-relaxed plum-soft">
          Inscrivez-vous pour recevoir nos nouveautés, nos ventes privées et nos conseils lingerie.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex w-full max-w-sm gap-3">
          <input
            type="email"
            required
            placeholder="Votre adresse email"
            className="w-full rounded-full border border-plum/20 bg-cream px-5 py-3 text-sm placeholder:text-plum/40 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-raspberry px-6 py-3 text-[11px] font-medium uppercase tracking-widest text-white transition hover:bg-raspberry-deep"
          >
            S'inscrire
          </button>
        </form>
      </div>
    </section>
  )
}
