import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'

/**
 * Dev only: serves /api/* from api/*.ts like Vercel does, so `npm run dev`
 * runs the whole site (the functions get the variables of .env.local).
 */
function vercelFunctionsInDev(): Plugin {
  const handle = async (server: ViteDevServer, req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const file = `api${url.pathname.replace(/^\/api/, '').replace(/\/$/, '')}.ts`
    if (!existsSync(file)) {
      res.statusCode = 404
      return res.end('Not found')
    }
    const mod = await server.ssrLoadModule(`/${file}`)
    const handler = mod[req.method ?? 'GET']
    if (typeof handler !== 'function') {
      res.statusCode = 405
      return res.end('Method not allowed')
    }
    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(chunk as Buffer)
    const body = chunks.length ? Buffer.concat(chunks) : undefined
    const headers = new Headers()
    for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v)
    const response: Response = await handler(new Request(url, { method: req.method, headers, body }))
    res.statusCode = response.status
    response.headers.forEach((value, key) => res.setHeader(key, value))
    res.end(Buffer.from(await response.arrayBuffer()))
  }

  return {
    name: 'vercel-functions-in-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        handle(server, req, res).catch((error: unknown) => {
          server.config.logger.error(String(error instanceof Error ? error.stack : error))
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(error) }))
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  if (mode === 'development') Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), tailwindcss(), vercelFunctionsInDev()],
  }
})
