/*
  Order e-mails, sent through Resend (https://resend.com) when RESEND_API_KEY
  and ORDER_EMAIL_FROM are set; otherwise nothing is sent.
  - the customer gets a confirmation with the link to their order page
  - ORDER_NOTIFY_EMAIL (the merchant) is told about each paid order, and
    loudly when CJ refused it.
*/
import { formatPrice } from '../src/lib/format.js'
import type { Order } from './orders.js'

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.ORDER_EMAIL_FROM
  if (!key || !from) return
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  })
  if (!res.ok) throw new Error(`Resend ${res.status} : ${await res.text()}`)
}

function linesHtml(order: Order) {
  return order.lines
    .map((l) => `<li>${l.quantity} × ${escapeHtml(l.name)} (${escapeHtml(l.color)}, ${escapeHtml(l.size)}) : ${formatPrice(l.unitPrice * l.quantity)}</li>`)
    .join('')
}

export async function sendOrderEmails(order: Order, origin: string) {
  const link = `${origin}/commande/${order.id}`
  const test = order.mode === 'test' ? '[TEST] ' : ''
  await send(
    order.customer.email,
    `${test}Votre commande Lucéa ${order.number}`,
    `<p>Bonjour ${escapeHtml(order.customer.firstName)},</p>
     <p>Merci pour votre commande <strong>${order.number}</strong>. Nous la préparons.</p>
     <ul>${linesHtml(order)}</ul>
     <p>Livraison : ${order.shipping ? formatPrice(order.shipping) : 'offerte'}<br><strong>Total : ${formatPrice(order.total)}</strong></p>
     <p><a href="${link}">Suivre ma commande</a></p>`,
  )
  const merchant = process.env.ORDER_NOTIFY_EMAIL
  if (!merchant) return
  const problem = order.status === 'cj_error'
  await send(
    merchant,
    `${test}${problem ? '⚠ À TRAITER : CJ a refusé la commande' : 'Nouvelle commande'} ${order.number} (${formatPrice(order.total)})`,
    `<p>${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)}, ${escapeHtml(order.address.zip)} ${escapeHtml(order.address.city)}</p>
     <ul>${linesHtml(order)}</ul>
     <p>${problem ? `<strong>CJ a refusé la commande :</strong> ${escapeHtml(order.cj?.error ?? '')}` : `Commande CJ : ${order.cj?.orderId ?? 'simulée'}`}</p>
     <p><a href="${origin}/admin/commandes">Ouvrir les commandes</a></p>`,
  )
}
