type EmptyFrameProps = {
  ratio?: string
  tone?: 'light' | 'dark'
  label?: string | null
  className?: string
  rounded?: string
}

export function EmptyFrame({
  ratio = '3 / 4',
  tone = 'light',
  label = 'Photo à venir',
  className = '',
  rounded = 'rounded-2xl',
}: EmptyFrameProps) {
  const surface = tone === 'light' ? 'bg-ivory border-plum/14' : 'bg-mauve/35 border-ivory/25'
  const text = tone === 'light' ? 'text-plum/45' : 'text-ivory/60'

  return (
    <div
      className={`flex items-center justify-center border ${surface} ${rounded} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {label && (
        <span className={`text-[11px] uppercase tracking-[0.14em] ${text}`}>{label}</span>
      )}
    </div>
  )
}
