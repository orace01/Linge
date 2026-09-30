/*
  npm run cj:sync  -> reads every variant's stock at CJ and writes the snapshot
  (Vercel Blob when BLOB_READ_WRITE_TOKEN is set, .data/stock.json otherwise).
  Run by GitHub Actions every 8 hours, see cj/README.md.
*/
import { loadEnvLocal } from './env.js'

loadEnvLocal()
const { syncStock } = await import('../server/sync.js')

const report = await syncStock((message) => console.log(message))
console.log(
  `\nSynchro ${report.source} : ${report.variants} variantes de ${report.products} produits en ${Math.round(report.durationMs / 1000)} s` +
    (process.env.BLOB_READ_WRITE_TOKEN ? ' → Vercel Blob' : ' → .data/stock.json'),
)
if (report.errors.length) {
  console.log(`${report.errors.length} variante(s) non lue(s), valeur précédente conservée :`)
  for (const e of report.errors) console.log(`- ${e.product} (${e.vid}) : ${e.message}`)
}
