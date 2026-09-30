
type InfoPageProps = {
  eyebrow: string
  title: string
  description: string
  withFrame?: boolean
}

export function InfoPage({ eyebrow, title, description, withFrame = true }: InfoPageProps) {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-16 text-center lg:py-24">
      <span className="text-[11px] uppercase tracking-[0.16em] text-wine">{eyebrow}</span>
      <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">{title}</h1>
      <p className="mx-auto mt-5 max-w-lg text-sm font-light leading-relaxed text-ink-muted">{description}</p>
      {withFrame && <div aria-hidden="true" className="tex-silk mx-auto mt-10 aspect-[21/9] w-full rounded-[28px]" />}
    </div>
  )
}
