type EmptyFrameProps = {
  ratio?: string
  label?: string | null
  className?: string
  rounded?: string
}

export function EmptyFrame({
  ratio = '3 / 4',
  label = 'Photo à venir',
  className = '',
  rounded = 'rounded-2xl',
}: EmptyFrameProps) {
  return (
    <div
      className={`flex items-center justify-center border border-border bg-surface ${rounded} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {label && <span className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">{label}</span>}
    </div>
  )
}
