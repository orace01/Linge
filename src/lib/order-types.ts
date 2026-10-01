/* Order shapes shared by the site and the server functions. */

export type CheckoutMode = 'off' | 'test' | 'live'

export type OrderStatus =
  | 'pending_payment'
  | 'paid' // paid, not yet handed to CJ
  | 'cj_error' // paid, but CJ refused the order: needs the merchant
  | 'sent_to_cj' // CJ has the order and prepares it
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type OrderCustomer = { email: string; firstName: string; lastName: string; phone: string }

export type OrderAddress = { line1: string; line2: string; zip: string; city: string; countryCode: 'FR' }

export type OrderLine = { slug: string; name: string; color: string; size: string; quantity: number; unitPrice: number }

/** What the customer may see of an order (status page). */
export type PublicOrder = {
  id: string
  number: string
  createdAt: string
  status: OrderStatus
  test: boolean
  lines: OrderLine[]
  subtotal: number
  shipping: number
  total: number
  firstName: string
  city: string
  tracking: { number: string; url?: string } | null
}

/** What the merchant sees (admin page). */
export type AdminOrder = PublicOrder & {
  customer: OrderCustomer
  address: OrderAddress
  paidAt?: string
  cj: { orderId?: string; status?: string; amountUsd?: number; simulated?: boolean; sandbox?: boolean; error?: string } | null
}
