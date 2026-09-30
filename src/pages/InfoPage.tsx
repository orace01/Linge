import { EmptyFrame } from '../components/EmptyFrame'

type InfoPageProps = {
  eyebrow: string
  title: string
  description: string
  withFrame?: boolean
}

export function InfoPage({ eyebrow, title, description, withFrame = true }: InfoPageProps) {
  return (
    <div className="mx-auto max-w-[900px] px-5 py-16 text-center lg:py-24">
      <span className="text-[11px] uppercase tracking-[0.16em] text-raspberry">{eyebrow}</span>
      <h1 className="mt-3 font-display text-4xl text-plum sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-5 max-w-lg text-sm font-light leading-relaxed plum-soft">{description}</p>
      {withFrame && <EmptyFrame ratio="21 / 9" tone="light" className="mx-auto mt-10 w-full" rounded="rounded-[28px]" />}
    </div>
  )
}
