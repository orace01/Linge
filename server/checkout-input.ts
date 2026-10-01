/* Validation of what the checkout form sends. */
import type { OrderAddress, OrderCustomer } from '../src/lib/order-types.js'

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '')

export function parseCustomer(input: unknown): { customer: OrderCustomer; address: OrderAddress } | { errors: Record<string, string> } {
  const c = ((input as { customer?: unknown })?.customer ?? {}) as Record<string, unknown>
  const a = ((input as { address?: unknown })?.address ?? {}) as Record<string, unknown>
  const customer: OrderCustomer = {
    email: clean(c.email, 120).toLowerCase(),
    firstName: clean(c.firstName, 60),
    lastName: clean(c.lastName, 60),
    phone: clean(c.phone, 20).replace(/[ .-]/g, ''),
  }
  const address: OrderAddress = {
    line1: clean(a.line1, 120),
    line2: clean(a.line2, 120),
    zip: clean(a.zip, 10).replace(/\s/g, ''),
    city: clean(a.city, 80),
    countryCode: 'FR',
  }
  const errors: Record<string, string> = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email)) errors.email = 'Adresse e-mail invalide'
  if (!customer.firstName) errors.firstName = 'Prénom requis'
  if (!customer.lastName) errors.lastName = 'Nom requis'
  if (!/^(\+33|0033|0)[1-9]\d{8}$/.test(customer.phone)) errors.phone = 'Numéro de téléphone français invalide'
  if (address.line1.length < 4) errors.line1 = 'Adresse requise'
  if (!/^\d{5}$/.test(address.zip)) errors.zip = 'Code postal à 5 chiffres'
  if (!address.city) errors.city = 'Ville requise'
  if (a.countryCode !== undefined && a.countryCode !== 'FR') errors.countryCode = 'Livraison en France uniquement pour le moment'
  return Object.keys(errors).length ? { errors } : { customer, address }
}
