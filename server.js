/**
 * Delegram Multi-Tenant Client Server v2
 * One server, all client sites served from DB
 * Route: *.delegram.app → this server → lookup company → render page
 */

const express = require('express')
const { platform, clients } = require('./db')
const { renderPage } = require('./renderer')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Subdomain resolution ──────────────────────────────────────────────────────

async function getCompany(req) {
  const subdomain = req.headers['x-client-subdomain'] || 
    req.hostname?.split('.')[0]
  if (!subdomain || subdomain === 'delegram-clients') return null

  // Look up via subdomain_routes in clients DB
  const route = await clients.query(
    `SELECT sr.company_id, sr.target_type, sr.target_id, sr.status
     FROM subdomain_routes sr
     WHERE sr.subdomain = $1 AND sr.status = 'active'`,
    [subdomain]
  )
  if (!route.rows.length) return null

  const { company_id } = route.rows[0]

  // Get company from platform DB
  const company = await platform.query(
    `SELECT id, name, slug, plan, status, credits_remaining, settings
     FROM companies WHERE id = $1 AND status = 'active'`,
    [company_id]
  )
  if (!company.rows.length) return null

  return { ...company.rows[0], subdomain }
}

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', async (req, res) => {
  const subdomain = req.headers['x-client-subdomain'] || req.hostname?.split('.')[0]
  res.json({ ok: true, subdomain: subdomain || 'delegram-clients' })
})

// ── Page rendering ────────────────────────────────────────────────────────────

app.get('*', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) {
      return res.status(404).send(notFoundPage(req.headers['x-client-subdomain']))
    }

    const path = req.path === '/' ? '/' : req.path

    // Get site for this company
    const siteResult = await clients.query(
      `SELECT s.id, s.name, s.slug, s.status, s.theme, s.seo
       FROM sites s
       WHERE s.company_id = $1 AND s.status = 'published'
       ORDER BY s.created_at DESC LIMIT 1`,
      [company.id]
    )

    if (!siteResult.rows.length) {
      return res.status(404).send(buildingPage(company))
    }

    const site = siteResult.rows[0]

    // Get page by path
    const pageResult = await clients.query(
      `SELECT p.id, p.slug, p.path, p.title, p.page_type, p.status,
              p.content_json, p.seo, p.is_homepage
       FROM pages p
       WHERE p.site_id = $1 
         AND p.status = 'published'
         AND (p.path = $2 OR (p.is_homepage = true AND $2 = '/'))
       LIMIT 1`,
      [site.id, path]
    )

    if (!pageResult.rows.length) {
      return res.status(404).send(notFoundPage(company.slug))
    }

    const page = pageResult.rows[0]

    // Track page view (fire and forget)
    clients.query(
      `INSERT INTO page_views (company_id, path, referrer, ua)
       VALUES ($1, $2, $3, $4)`,
      [company.id, path, req.headers['referer'] || '', req.headers['user-agent'] || '']
    ).catch(() => {})

    // Render page
    const html = renderPage({ company, site, page })
    res.send(html)

  } catch (err) {
    console.error('Page render error:', err)
    res.status(500).send('<h1>Something went wrong</h1>')
  }
})

// ── Subscribe form ────────────────────────────────────────────────────────────

app.post('/subscribe', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).json({ error: 'Not found' })

    const { email, name } = req.body
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' })
    }

    await clients.query(
      `INSERT INTO subscribers (company_id, email, name, source)
       VALUES ($1, $2, $3, 'landing')
       ON CONFLICT (company_id, email) DO UPDATE SET name = EXCLUDED.name`,
      [company.id, email.toLowerCase().trim(), name || '']
    )

    res.json({ ok: true, message: "You're on the list!" })
  } catch (err) {
    console.error('Subscribe error:', err)
    res.status(500).json({ error: 'Failed to subscribe' })
  }
})

// ── Admin stats API ───────────────────────────────────────────────────────────

app.get('/api/stats', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).json({ error: 'Not found' })

    const adminKey = req.headers['x-admin-key'] || req.query.key
    if (!adminKey) return res.status(401).json({ error: 'Unauthorized' })

    // Validate admin key against company settings
    if (company.settings?.admin_key && adminKey !== company.settings.admin_key) {
      return res.status(401).json({ error: 'Invalid key' })
    }

    const [subs, views, contacts] = await Promise.all([
      clients.query('SELECT COUNT(*) FROM subscribers WHERE company_id = $1', [company.id]),
      clients.query('SELECT COUNT(*) FROM page_views WHERE company_id = $1 AND created_at > NOW() - INTERVAL \'7 days\'', [company.id]),
      clients.query('SELECT COUNT(*) FROM contacts WHERE company_id = $1', [company.id]),
    ])

    res.json({
      company: company.name,
      subdomain: company.slug,
      subscribers: parseInt(subs.rows[0].count),
      page_views_7d: parseInt(views.rows[0].count),
      contacts: parseInt(contacts.rows[0].count),
      plan: company.plan,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Fallbacks ─────────────────────────────────────────────────────────────────

function notFoundPage(subdomain) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:4rem;background:#000;color:#fff">
<h1 style="color:#22c55e">delegram</h1>
<p style="margin-top:1rem;color:#666">${subdomain ? `${subdomain}.delegram.app` : 'This page'} was not found.</p>
</body></html>`
}

function buildingPage(company) {
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:4rem;background:#050f07;color:#f0fdf4">
<h1 style="color:#22c55e">${company.name}</h1>
<p style="margin-top:1rem;color:#86efac">We're building something great. Check back soon.</p>
</body></html>`
}

app.listen(PORT, () => {
  console.log(`Delegram client server v2 running on port ${PORT}`)
})
