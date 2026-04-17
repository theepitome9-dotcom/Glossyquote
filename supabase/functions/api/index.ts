// Supabase Edge Function: api
// Proxies admin dashboard requests to the Vibecode backend
// This allows the published App Store app to access admin data
// via the Supabase URL (EXPO_PUBLIC_API_URL fallback)

const VIBECODE_BACKEND = 'https://preview-kotjzxnhroef.dev.vibecode.run'
const INTERNAL_SECRET = '261338735034c6d41e4a08c52e2d4ce0e595898c29b6caaa8dbb1d626764f110'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
    })
  }

  const url = new URL(req.url)

  // Extract path — Supabase passes full URL, we need the part from /api onwards
  // e.g. /functions/v1/api/users/admin -> /api/users/admin
  let path = url.pathname
  const match = path.match(/\/api(\/.*)?$/)
  if (match) {
    path = `/api${match[1] || ''}`
  }

  const targetUrl = `${VIBECODE_BACKEND}${path}${url.search}`

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'x-internal-secret': INTERNAL_SECRET,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy error', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})
