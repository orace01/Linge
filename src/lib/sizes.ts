const LETTER_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'XXXL', '3XL', '4XL', '5XL', '6XL']

/** Sort key: letter sizes first (XS → 6XL), then bra sizes (70A → 95F), then the rest. */
function rank(size: string): number {
  const letter = LETTER_SIZES.indexOf(size.toUpperCase())
  if (letter >= 0) return letter
  const bra = size.match(/^(\d{2,3})([A-H]*)$/i)
  if (bra) return 1000 + Number(bra[1]) * 10 + (bra[2] ? bra[2].toUpperCase().charCodeAt(0) - 64 : 0)
  return 100_000
}

export function compareSizes(a: string, b: string) {
  return rank(a) - rank(b) || a.localeCompare(b)
}
