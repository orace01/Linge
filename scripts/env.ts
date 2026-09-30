import { existsSync, readFileSync } from 'node:fs'

/** Loads .env.local into process.env (tsx does not); variables already set win. */
export function loadEnvLocal() {
  if (!existsSync('.env.local')) return
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/)
    if (m && m[2] && process.env[m[1]] === undefined) process.env[m[1]] = m[2]
  }
}
