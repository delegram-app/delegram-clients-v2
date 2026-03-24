/**
 * Delegram Multi-Tenant Client Server v2
 * One server, all client sites served from DB
 * Route: *.delegram.app → this server → lookup company → render page
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') })

const express = require('express')
const path = require('path')
const multer = require('multer')
const { platform, clients } = require('./db')
const { renderPage, renderBlogPost, renderBlogListing } = require('./renderer')
const { uploadAsset, listAssets } = require('./storage')
const Stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const app = express()
const PORT = process.env.PORT || 3000

// Raw body for Stripe webhooks
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/assets', express.static(path.join(__dirname, 'public'), { maxAge: '7d' }))

// ── Subdomain resolution ──────────────────────────────────────────────────────

async function getCompany(req) {
  const rawHost = req.headers['x-client-subdomain'] || req.headers['x-forwarded-host'] || req.headers['host'] || req.hostname || ''
  const subdomain = rawHost.split('.')[0].toLowerCase()
  if (!subdomain || subdomain === 'delegram-clients' || subdomain === 'delegram' || subdomain === 'www') return null

  // Look up via subdomain_routes in clients DB
  const route = await clients.query(
    `SELECT sr.company_id, sr.target_type, sr.target_id, sr.status
     FROM subdomain_routes sr
     WHERE sr.subdomain = $1 AND sr.status = 'active'`,
    [subdomain]
  )
  if (!route.rows.length) return null

  const { company_id } = route.rows[0]

  // Get company from clients DB (source of truth for tenant data)
  const company = await clients.query(
    `SELECT id, name, slug, plan, status, settings
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

// ── Listings API ─────────────────────────────────────────────────────────────

app.get('/api/listings', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).json({ error: 'Not found' })

    const { category, location, search, featured, limit = 20, offset = 0 } = req.query
    const conditions = ['company_id = $1', "status = 'active'"]
    const params = [company.id]
    let i = 2

    if (category) { conditions.push(`category = $${i++}`); params.push(category) }
    if (location) { conditions.push(`location ILIKE $${i++}`); params.push(`%${location}%`) }
    if (featured === 'true') { conditions.push(`featured = true`) }
    if (search) {
      conditions.push(`(title ILIKE $${i} OR description ILIKE $${i})`)
      params.push(`%${search}%`); i++
    }

    const where = conditions.join(' AND ')
    const [rows, countRow] = await Promise.all([
      clients.query(`SELECT * FROM listings WHERE ${where} ORDER BY featured DESC, created_at DESC LIMIT $${i} OFFSET $${i+1}`, [...params, parseInt(limit), parseInt(offset)]),
      clients.query(`SELECT COUNT(*) FROM listings WHERE ${where}`, params)
    ])

    res.json({ listings: rows.rows, total: parseInt(countRow.rows[0].count) })
  } catch (err) {
    console.error('Listings GET error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/listings', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).json({ error: 'Not found' })
    const adminKey = req.headers['x-admin-key']
    if (!adminKey || (company.settings?.admin_key && adminKey !== company.settings.admin_key)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const { title, category, location, description, tags, images, contact, metadata, featured, stripe_price_id } = req.body
    if (!title) return res.status(400).json({ error: 'title is required' })
    const result = await clients.query(
      `INSERT INTO listings (company_id, title, category, location, description, tags, images, contact, metadata, featured, stripe_price_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [company.id, title, category||null, location||null, description||null,
       JSON.stringify(tags||[]), JSON.stringify(images||[]), JSON.stringify(contact||{}),
       JSON.stringify(metadata||{}), featured||false, stripe_price_id||null]
    )
    res.json({ listing: result.rows[0] })
  } catch (err) {
    console.error('Listings POST error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/listings/:id', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).json({ error: 'Not found' })
    const adminKey = req.headers['x-admin-key']
    if (!adminKey || (company.settings?.admin_key && adminKey !== company.settings.admin_key)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const { title, category, location, description, tags, images, contact, metadata, featured, stripe_price_id, status } = req.body
    const result = await clients.query(
      `UPDATE listings SET
        title=COALESCE($1,title), category=COALESCE($2,category), location=COALESCE($3,location),
        description=COALESCE($4,description), tags=COALESCE($5::jsonb,tags), images=COALESCE($6::jsonb,images),
        contact=COALESCE($7::jsonb,contact), metadata=COALESCE($8::jsonb,metadata),
        featured=COALESCE($9,featured), stripe_price_id=COALESCE($10,stripe_price_id),
        status=COALESCE($11,status)
       WHERE id=$12 AND company_id=$13 RETURNING *`,
      [title||null, category||null, location||null, description||null,
       tags?JSON.stringify(tags):null, images?JSON.stringify(images):null,
       contact?JSON.stringify(contact):null, metadata?JSON.stringify(metadata):null,
       featured!=null?featured:null, stripe_price_id||null, status||null,
       req.params.id, company.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' })
    res.json({ listing: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/listings/:id', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).json({ error: 'Not found' })
    const adminKey = req.headers['x-admin-key']
    if (!adminKey || (company.settings?.admin_key && adminKey !== company.settings.admin_key)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    await clients.query(`UPDATE listings SET status='inactive' WHERE id=$1 AND company_id=$2`, [req.params.id, company.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Stripe / Payments ────────────────────────────────────────────────────────

app.post('/api/checkout', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).json({ error: 'Not found' })
    if (!Stripe) return res.status(503).json({ error: 'Stripe not configured' })

    const { price_id, success_url, cancel_url, customer_email, metadata } = req.body
    if (!price_id) return res.status(400).json({ error: 'price_id required' })

    const session = await Stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: success_url || `${req.headers.origin || ''}/thank-you`,
      cancel_url: cancel_url || `${req.headers.origin || ''}/`,
      customer_email: customer_email || undefined,
      metadata: { company_id: company.id, ...metadata }
    })

    // Save to DB
    clients.query(
      `INSERT INTO checkouts (company_id, provider, external_checkout_id, status, success_url, cancel_url, metadata)
       VALUES ($1, 'stripe', $2, 'created', $3, $4, $5)`,
      [company.id, session.id, session.success_url, session.cancel_url, JSON.stringify(metadata||{})]
    ).catch(() => {})

    res.json({ url: session.url, session_id: session.id })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/webhooks/stripe', async (req, res) => {
  try {
    const payload = req.body
    let event
    try {
      event = JSON.parse(payload.toString())
    } catch {
      return res.status(400).json({ error: 'Invalid payload' })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      // Update checkout status
      await clients.query(
        `UPDATE checkouts SET status='completed', completed_at=now() WHERE external_checkout_id=$1`,
        [session.id]
      ).catch(() => {})
      // Save payment record
      const companyId = session.metadata?.company_id
      if (companyId && session.amount_total) {
        await clients.query(
          `INSERT INTO payments (company_id, provider, external_payment_id, amount, currency, status, paid_at)
           VALUES ($1, 'stripe', $2, $3, $4, 'succeeded', now())
           ON CONFLICT (provider, external_payment_id) DO NOTHING`,
          [companyId, session.payment_intent || session.id, session.amount_total / 100, (session.currency||'usd').toUpperCase()]
        ).catch(() => {})
      }
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ── Asset Upload (Spaces) ────────────────────────────────────────────────────

app.post('/api/assets/upload', upload.single('file'), async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).json({ error: 'Not found' })
    const adminKey = req.headers['x-admin-key']
    if (!adminKey || (company.settings?.admin_key && adminKey !== company.settings.admin_key)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'bin'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
    const url = await uploadAsset(company.slug, filename, req.file.buffer, req.file.mimetype)

    // Save to media_assets table
    await clients.query(
      `INSERT INTO media_assets (company_id, file_name, mime_type, storage_url, size_bytes)
       VALUES ($1, $2, $3, $4, $5)`,
      [company.id, req.file.originalname, req.file.mimetype, url, req.file.size]
    ).catch(() => {})

    res.json({ ok: true, url, filename })
  } catch (err) {
    console.error('Asset upload error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/assets', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).json({ error: 'Not found' })
    const assets = await listAssets(company.slug)
    res.json({ assets })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Auth stubs ────────────────────────────────────────────────────────────────

app.get('/api/auth/session', async (req, res) => {
  res.json({ user: null })
})

app.post('/api/auth/login', async (req, res) => {
  res.json({ ok: false, message: 'Auth not yet implemented' })
})

// ── Blog listing ──────────────────────────────────────────────────────────────

app.get('/blog', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).send(notFoundPage(req.headers['x-client-subdomain']))

    const siteResult = await clients.query(
      `SELECT s.id, s.name, s.slug, s.status, s.theme, s.seo
       FROM sites s
       WHERE s.company_id = $1 AND s.status = 'published'
       ORDER BY s.created_at DESC LIMIT 1`,
      [company.id]
    )
    if (!siteResult.rows.length) return res.status(404).send('<h1>Site not found</h1>')
    const site = siteResult.rows[0]

    const postsResult = await clients.query(
      `SELECT p.id, p.slug, p.path, p.title, p.page_type, p.status, p.content_json, p.published_at
       FROM pages p
       WHERE p.site_id = $1 AND p.page_type = 'blog_post' AND p.status = 'published'
       ORDER BY p.published_at DESC`,
      [site.id]
    )

    const html = renderBlogListing(postsResult.rows, site, company)
    res.send(html)
  } catch (err) {
    console.error('Blog listing error:', err)
    res.status(500).send('<h1>Something went wrong</h1>')
  }
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

app.post('/contact', async (req, res) => {
  try {
    const company = await getCompany(req)
    if (!company) return res.status(404).json({ error: 'Not found' })

    const { name, email, message } = req.body
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' })
    }

    const cleanEmail = email.toLowerCase().trim()
    const submittedAt = new Date().toISOString()

    // Store in clients DB subscribers table
    await clients.query(
      `INSERT INTO subscribers (company_id, email, name, source, custom_fields)
       VALUES ($1, $2, $3, 'contact_form', $4)
       ON CONFLICT (company_id, email) DO UPDATE SET 
         name = EXCLUDED.name,
         custom_fields = EXCLUDED.custom_fields`,
      [company.id, cleanEmail, name || '', JSON.stringify({ message, submitted_at: submittedAt })]
    )

    // Also store in platform DB so it appears in dashboard leads section
    try {
      const tenant = await platform.query('SELECT id FROM tenants WHERE subdomain = $1', [company.slug])
      if (tenant.rows[0]) {
        await platform.query(
          `INSERT INTO subscribers (tenant_id, email, name, source, notes, created_at)
           VALUES ($1, $2, $3, 'contact_form', $4, NOW())
           ON CONFLICT (tenant_id, email) DO UPDATE SET name = EXCLUDED.name, notes = EXCLUDED.notes`,
          [tenant.rows[0].id, cleanEmail, name || '', message || '']
        )
      }
    } catch (e) {
      // Platform sync optional — don't fail if it errors
      console.error('Platform lead sync error:', e.message)
    }

    res.json({ ok: true })
  } catch (err) {
    console.error('Contact error:', err)
    res.status(500).send('Something went wrong. Please try again.')
  }
})

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

    // Also sync to platform DB for dashboard leads
    try {
      const tenant = await platform.query('SELECT id FROM tenants WHERE subdomain = $1', [company.slug])
      if (tenant.rows[0]) {
        await platform.query(
          `INSERT INTO subscribers (tenant_id, email, name, source, created_at)
           VALUES ($1, $2, $3, 'landing_page', NOW())
           ON CONFLICT (tenant_id, email) DO UPDATE SET name = EXCLUDED.name`,
          [tenant.rows[0].id, email.toLowerCase().trim(), name || '']
        )
      }
    } catch (e) {
      console.error('Platform lead sync error:', e.message)
    }

    // Check if it's a form POST (accepts HTML) or AJAX (accepts JSON)
    const wantsJson = req.headers.accept?.includes('application/json') || req.headers['x-requested-with']
    if (wantsJson) {
      return res.json({ ok: true, message: "You're on the list!" })
    }
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're in!</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: -apple-system, 'Inter', sans-serif; background: #0D1B2A; color: #E8E0D4; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .card { text-align: center; max-width: 480px; }
    .icon { font-size: 3rem; margin-bottom: 1.5rem; }
    h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 1rem; }
    p { opacity: 0.7; line-height: 1.7; margin-bottom: 2rem; }
    a { display: inline-block; background: #B8974A; color: #0D1B2A; padding: 0.75rem 2rem; text-decoration: none; font-weight: 600; border-radius: 2px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>You're on the list!</h1>
    <p>Thanks for signing up. We'll be in touch soon.</p>
    <a href="/">← Back to site</a>
  </div>
</body>
</html>`)
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
      plan: company.plan || 'starter',
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
