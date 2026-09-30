export function json(data: unknown, init: { status?: number; cache?: string } = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': init.cache ?? 'no-store' },
  })
}
