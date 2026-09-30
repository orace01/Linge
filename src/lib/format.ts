const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

/** 23.9 -> "23,90 €" */
export function formatPrice(value: number) {
  return euros.format(value)
}
