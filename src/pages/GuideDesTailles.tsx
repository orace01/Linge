const rows = [
  { size: 'XS', tour: '78–82 cm', poitrine: '80–84 cm' },
  { size: 'S', tour: '82–86 cm', poitrine: '84–88 cm' },
  { size: 'M', tour: '86–90 cm', poitrine: '88–92 cm' },
  { size: 'L', tour: '90–94 cm', poitrine: '92–96 cm' },
]

export function GuideDesTailles() {
  return (
    <div className="mx-auto max-w-[700px] px-5 py-16 lg:py-24">
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-[0.16em] text-raspberry">Guide</span>
        <h1 className="mt-3 font-display text-4xl text-plum sm:text-5xl">Guide des tailles</h1>
        <p className="mx-auto mt-5 max-w-md text-sm font-light leading-relaxed plum-soft">
          Un repère indicatif pour vous aider à choisir votre taille. En cas de doute entre deux tailles, privilégiez
          la taille au-dessus.
        </p>
      </div>

      <table className="mt-12 w-full border-collapse overflow-hidden rounded-2xl text-sm">
        <thead>
          <tr className="bg-ivory text-left">
            <th className="px-4 py-3 text-[11px] uppercase tracking-wide text-plum">Taille</th>
            <th className="px-4 py-3 text-[11px] uppercase tracking-wide text-plum">Tour de taille</th>
            <th className="px-4 py-3 text-[11px] uppercase tracking-wide text-plum">Tour de poitrine</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.size} className="border-b border-plum/8">
              <td className="px-4 py-3 font-display text-plum">{r.size}</td>
              <td className="px-4 py-3 plum-soft">{r.tour}</td>
              <td className="px-4 py-3 plum-soft">{r.poitrine}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
