/**
 * Page renderer - assembles HTML from content_json
 * content_json is a component tree: { type, props, children }
 */

'use strict'
const { iconSvg } = require('./icons.js')
const { marked } = require('marked')

// ─── 6 Industry Themes ──────────────────────────────────────────────────────

const THEMES = {

  // 1. Prestige — Luxury, chauffeur, private aviation, high-end hospitality
  prestige: {
    bg: '#0D1B2A',
    text: '#E8E0D4',
    primary: '#B8974A',
    muted: 'rgba(184,151,74,0.12)',
    border: 'rgba(184,151,74,0.25)',
    borderSubtle: 'rgba(184,151,74,0.2)',
    cardBg: 'rgba(255,255,255,0.06)',  // Increased opacity for readable contrast
    navBorder: 'rgba(184,151,74,0.15)',
    radius: '0px',
    radiusLg: '2px',
    btnRadius: '0px',
    fontHeading: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontBody: "'Inter', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
    headingWeight: '600',
    headingTracking: 'letter-spacing:0.01em',
    eyebrowStyle: 'letter-spacing:0.25em;font-size:0.7rem;text-transform:uppercase;font-weight:400;opacity:0.7;',
    statValueColor: '#B8974A',
    shadow: '0 2px 12px rgba(0,0,0,0.4)',
    heroAlign: 'center',
    sectionPadding: '7rem 2rem',
    customCss: `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
      h1,h2,h3 { font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif; font-weight: 600; letter-spacing: 0.01em; }
      h1 { font-size: clamp(2.8rem, 6vw, 5rem) !important; line-height: 1.05 !important; }
      h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem) !important; }
      nav a { font-weight: 300; letter-spacing: 0.08em; font-size: 0.85rem; text-transform: uppercase; }
      body { background: var(--bg); color: var(--text); }
      nav { background: color-mix(in srgb, var(--bg) 97%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--primary) 25%, transparent); }
      .card { background: color-mix(in srgb, var(--primary) 8%, var(--bg)) !important; border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent) !important; }
      .card h3 { color: var(--text) !important; opacity: 1 !important; }
      .card p { color: var(--text) !important; opacity: 0.85 !important; }
      a[href] { text-decoration: none; }
      button, a.btn { border-radius: 0 !important; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.85rem; font-weight: 500; }
      p { font-weight: 300; line-height: 1.9; opacity: 0.85; color: var(--text); }
      .testimonial-quote { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 1.1rem; }
    `,
  },

  // 2. Corporate — B2B SaaS, fintech, professional services, tech
  corporate: {
    bg: '#060B18',
    text: '#EEF2FF',
    primary: '#818CF8',
    muted: 'rgba(129,140,248,0.1)',
    border: 'rgba(129,140,248,0.25)',
    borderSubtle: 'rgba(255,255,255,0.06)',
    cardBg: 'rgba(255,255,255,0.03)',
    navBorder: 'rgba(255,255,255,0.06)',
    radius: '8px',
    radiusLg: '16px',
    btnRadius: '6px',
    fontHeading: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
    fontBody: "'Inter', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    headingWeight: '800',
    headingTracking: 'letter-spacing:-0.04em',
    eyebrowStyle: 'letter-spacing:0.1em;font-size:0.75rem;text-transform:uppercase;font-weight:600;',
    statValueColor: '#818CF8',
    shadow: '0 4px 32px rgba(129,140,248,0.12)',
    heroAlign: 'center',
    sectionPadding: '5rem 2rem',
    customCss: `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      body { background: var(--bg); color: var(--text); }
      h1,h2,h3 { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
      h1 { font-size: clamp(2.5rem, 5.5vw, 4.5rem) !important; }
      nav { background: color-mix(in srgb, var(--bg) 95%, transparent); backdrop-filter: blur(16px); }
      .stat-value { font-variant-numeric: tabular-nums; }
      .card { background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)) !important; backdrop-filter: blur(8px); color: var(--text) !important; }
      a[href]:not(nav a) { border-bottom: 1px solid color-mix(in srgb, var(--primary) 40%, transparent); }
    `,
  },

  // 3. Fresh — Health, wellness, fitness, nutrition, coaching
  fresh: {
    bg: '#FAFAF8',
    text: '#1A2E1A',
    primary: '#16A34A',
    muted: 'rgba(22,163,74,0.08)',
    border: 'rgba(22,163,74,0.2)',
    borderSubtle: 'rgba(0,0,0,0.07)',
    cardBg: '#FFFFFF',
    navBorder: 'rgba(0,0,0,0.07)',
    radius: '16px',
    radiusLg: '24px',
    btnRadius: '999px',
    fontHeading: "'DM Sans', -apple-system, sans-serif",
    fontBody: "'DM Sans', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap",
    headingWeight: '700',
    headingTracking: 'letter-spacing:-0.02em',
    eyebrowStyle: 'letter-spacing:0.04em;font-size:0.8rem;text-transform:uppercase;font-weight:600;',
    statValueColor: '#16A34A',
    shadow: '0 2px 16px rgba(0,0,0,0.06)',
    heroAlign: 'center',
    sectionPadding: '5rem 2rem',
    customCss: `
      body { background: #FAFAF8; }
      nav { background: rgba(250,250,248,0.95); backdrop-filter: blur(12px); }
      a { color: #16A34A; }
    `,
  },

  // 4. Forge — Construction, real estate, logistics, manufacturing, trades
  forge: {
    bg: '#111827',
    text: '#F9FAFB',
    primary: '#EA580C',
    muted: 'rgba(234,88,12,0.12)',
    border: 'rgba(234,88,12,0.3)',
    borderSubtle: 'rgba(255,255,255,0.08)',
    cardBg: 'rgba(255,255,255,0.04)',
    navBorder: 'rgba(255,255,255,0.08)',
    radius: '4px',
    radiusLg: '8px',
    btnRadius: '4px',
    fontHeading: "'Inter', -apple-system, sans-serif",
    fontBody: "'Inter', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
    headingWeight: '900',
    headingTracking: 'letter-spacing:-0.03em',
    eyebrowStyle: 'letter-spacing:0.15em;font-size:0.75rem;text-transform:uppercase;font-weight:700;',
    statValueColor: '#EA580C',
    shadow: '0 4px 16px rgba(0,0,0,0.4)',
    heroAlign: 'left',
    sectionPadding: '5rem 2rem',
    customCss: `
      h1,h2 { text-transform: uppercase; }
    `,
  },

  // 5. Warm — Hospitality, restaurants, boutique retail, events, travel
  warm: {
    bg: '#FDF6EC',
    text: '#2C1810',
    primary: '#92400E',
    muted: 'rgba(146,64,14,0.08)',
    border: 'rgba(146,64,14,0.18)',
    borderSubtle: 'rgba(44,24,16,0.1)',
    cardBg: '#FFFFFF',
    navBorder: 'rgba(44,24,16,0.1)',
    radius: '12px',
    radiusLg: '20px',
    btnRadius: '8px',
    fontHeading: "'Lora', Georgia, serif",
    fontBody: "'Inter', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap",
    headingWeight: '600',
    headingTracking: 'letter-spacing:-0.01em',
    eyebrowStyle: 'letter-spacing:0.12em;font-size:0.8rem;text-transform:uppercase;font-weight:500;',
    statValueColor: '#92400E',
    shadow: '0 2px 12px rgba(44,24,16,0.1)',
    heroAlign: 'center',
    sectionPadding: '5rem 2rem',
    customCss: `
      h1,h2,h3 { font-family: 'Lora', Georgia, serif; }
      body { background: #FDF6EC; }
      a { color: #92400E; }
      nav { background: rgba(253,246,236,0.95); }
    `,
  },

  // 6. Signal — DTC, e-commerce, consumer apps, media, marketplaces
  signal: {
    bg: '#FFFFFF',
    text: '#09090B',
    primary: '#2563EB',
    muted: 'rgba(37,99,235,0.08)',
    border: 'rgba(37,99,235,0.2)',
    borderSubtle: 'rgba(0,0,0,0.08)',
    cardBg: '#F8FAFC',
    navBorder: 'rgba(0,0,0,0.08)',
    radius: '12px',
    radiusLg: '16px',
    btnRadius: '8px',
    fontHeading: "'Inter', -apple-system, sans-serif",
    fontBody: "'Inter', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
    headingWeight: '800',
    headingTracking: 'letter-spacing:-0.04em',
    eyebrowStyle: 'letter-spacing:0.06em;font-size:0.8rem;text-transform:uppercase;font-weight:600;',
    statValueColor: '#2563EB',
    shadow: '0 2px 16px rgba(0,0,0,0.08)',
    heroAlign: 'center',
    sectionPadding: '5rem 2rem',
    customCss: `
      body { background: #fff; }
      a { color: #2563EB; }
    `,
  },
}

// Fallback
THEMES.default = THEMES.corporate

// ─── Theme picker ────────────────────────────────────────────────────────────

function resolveTheme(siteTheme) {
  const key = siteTheme?.theme_key
  const base = (key && THEMES[key]) ? { ...THEMES[key], _key: key } : { ...THEMES.corporate, _key: 'corporate' }

  // Override with explicit values if set — these take priority over theme defaults
  if (siteTheme?.primary_color) base.primary = siteTheme.primary_color
  if (siteTheme?.bg_color) base.bg = siteTheme.bg_color
  if (siteTheme?.text_color) base.text = siteTheme.text_color
  if (siteTheme?.font_heading) base.fontHeading = siteTheme.font_heading
  if (siteTheme?.font_body) base.fontBody = siteTheme.font_body
  if (siteTheme?.font_import) base.fontImport = siteTheme.font_import

  return base
}

// ─── Page renderer ───────────────────────────────────────────────────────────

function renderPage({ company, site, page }) {
  // Blog post and blog listing have their own renderers
  if (page.page_type === 'blog_post') return renderBlogPost(page, site, company)
  if (page.page_type === 'blog_listing') return renderBlogListing([], site, company)

  let T = resolveTheme(site.theme || {})

  // Override with brand colors if extracted from existing website
  const brandColors = page.content_json?.props?.brand_colors
  if (brandColors?.primary) {
    // Convert hex to determine if dark/light and adjust palette
    const hex = brandColors.primary.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255
    const isDarkPrimary = luminance < 0.5

    T = {
      ...T,
      primary: brandColors.secondary || (isDarkPrimary ? brandColors.primary : brandColors.primary),
      bg: isDarkPrimary ? brandColors.primary : (brandColors.secondary || T.bg),
      muted: brandColors.primary + '18',
      border: brandColors.primary + '33',
      statValueColor: brandColors.secondary || brandColors.primary,
    }
  }

  const seo = { ...(site.seo || {}), ...(page.seo || {}) }

  // Auto-assign section IDs from content context if missing
  const contentJson = page.content_json
  if (contentJson?.children) {
    contentJson.children.forEach((child, i) => {
      if (child.type !== 'section') return
      if (child.props?.id) return // already has ID
      const text = JSON.stringify(child).toLowerCase()
      if (text.includes('feature') || text.includes('service') || text.includes('what we')) child.props = { ...child.props, id: 'services' }
      else if (text.includes('testimonial') || text.includes('client') || text.includes('what.*say')) child.props = { ...child.props, id: 'testimonials' }
      else if (text.includes('subscribe') || text.includes('waitlist') || text.includes('contact') || text.includes('get started')) child.props = { ...child.props, id: 'contact' }
      else if (text.includes('stat') || text.includes('value') || (i === 1 && text.includes('flex'))) child.props = { ...child.props, id: 'about' }
    })
  }

  const bodyHtml = renderComponents(contentJson, T)

  const isDark = T.bg.startsWith('#0') || T.bg.startsWith('#1') || T.bg.startsWith('#09')

  // Detect lead capture mode (single section with form)
  const isLeadCapture = contentJson && contentJson.children && contentJson.children.length <= 2 &&
    JSON.stringify(contentJson).includes('"subscribe_form"')
  let globalCss = ''
  if (isLeadCapture) {
    // Add full-height body styling for lead capture pages
    globalCss += `
    body { min-height: 100vh; display: flex; flex-direction: column; }
    .lead-capture-page { flex: 1; }
  `
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(seo.title || page.title)} | ${escapeHtml(company.name)}</title>
${seo.description ? `<meta name="description" content="${escapeAttr(seo.description)}">` : ''}
${seo.og_image ? `<meta property="og:image" content="${escapeAttr(seo.og_image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${escapeAttr(seo.og_image)}">
<meta name="twitter:title" content="${escapeAttr(seo.title || page.title)}">
${seo.description ? `<meta name="twitter:description" content="${escapeAttr(seo.description)}">` : ''}` : '<meta name="twitter:card" content="summary">'}
${seo.og_url ? `<meta property="og:url" content="${escapeAttr(seo.og_url)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeAttr(seo.title || page.title)}">
${seo.description ? `<meta property="og:description" content="${escapeAttr(seo.description)}">` : ''}
${T.fontImport ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${T.fontImport}" rel="stylesheet">` : ''}
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --primary: ${T.primary};
    --bg: ${T.bg};
    --text: ${T.text};
    --font: ${T.fontBody};
    --radius: ${T.radius};
    --border: ${T.borderSubtle};
    --card-bg: ${T.cardBg};
    --muted: ${T.muted};
    --shadow: ${T.shadow};
  }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; }
  a { color: var(--primary); }
  img { max-width: 100%; }
  /* ── Scroll reveal ── */
  .revealed { opacity: 1 !important; transform: translateY(0) !important; }
  /* ── Mobile base ── */
  @media (max-width: 768px) {
    section { padding: 3rem 1.25rem !important; }
    h1 { font-size: clamp(2rem, 8vw, 3.5rem) !important; }
    h2 { font-size: clamp(1.5rem, 6vw, 2.2rem) !important; }
    .page > div[style*="max-width:820px"], .page > div[style*="max-width: 820px"] { padding: 0 1.25rem !important; margin: 3rem auto !important; }
    [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
    [style*="display:flex"][style*="gap:3rem"] { flex-direction: column !important; gap: 1.5rem !important; align-items: center !important; }
    [style*="padding:1.5rem 2.5rem"] { padding: 1rem 1.25rem !important; }
  }
  ${T.customCss || ''}
  ${globalCss}
</style>
</head>
<body>
${bodyHtml}

<!-- Contact modal for dead links -->
<div id="contact-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999;align-items:center;justify-content:center;padding:1rem">
  <div style="background:${T.bg};border:1px solid ${T.border};border-radius:${T.radiusLg};padding:2.5rem;max-width:460px;width:100%;position:relative">
    <button onclick="document.getElementById('contact-modal').style.display='none'" style="position:absolute;top:1rem;right:1rem;background:none;border:none;cursor:pointer;opacity:0.5;color:${T.text};font-size:1.25rem">✕</button>
    <h3 style="font-family:${T.fontHeading};font-size:1.5rem;font-weight:${T.headingWeight};margin-bottom:0.5rem">Get in touch</h3>
    <p style="opacity:0.6;margin-bottom:1.5rem;font-size:0.95rem">Fill in your details and we'll get back to you shortly.</p>
    <form id="contact-form" style="display:flex;flex-direction:column;gap:1rem">
      <input name="name" placeholder="Your name" required style="padding:0.8rem 1rem;border:1px solid ${T.border};border-radius:${T.radius};background:${T.cardBg};color:${T.text};font-size:0.95rem;outline:none;font-family:inherit">
      <input name="email" type="email" placeholder="Email address" required style="padding:0.8rem 1rem;border:1px solid ${T.border};border-radius:${T.radius};background:${T.cardBg};color:${T.text};font-size:0.95rem;outline:none;font-family:inherit">
      <textarea name="message" placeholder="How can we help?" rows="3" style="padding:0.8rem 1rem;border:1px solid ${T.border};border-radius:${T.radius};background:${T.cardBg};color:${T.text};font-size:0.95rem;outline:none;font-family:inherit;resize:vertical"></textarea>
      <button type="submit" style="background:${T.primary};color:#fff;padding:0.85rem;border:none;border-radius:${T.btnRadius};font-weight:600;cursor:pointer;font-size:1rem;font-family:inherit">Send Message</button>
    </form>
  </div>
</div>

<script>
// Contact modal trigger
document.querySelectorAll('a[href="#contact"],a[href="#waitlist"],a[href="#cta"],a[href="#"]').forEach(a => {
  if (!a.closest('#contact-modal') && !a.dataset.noModal) {
    a.addEventListener('click', function(e) {
      const target = this.getAttribute('href')
      // Check if there's a real section with that ID
      if (target && target !== '#' && document.querySelector(target)) return
      e.preventDefault()
      const modal = document.getElementById('contact-modal')
      modal.style.display = 'flex'
    })
  }
})

// Close modal on backdrop click
document.getElementById('contact-modal').addEventListener('click', function(e) {
  if (e.target === this) this.style.display = 'none'
})

// Contact form submit
document.getElementById('contact-form')?.addEventListener('submit', async function(e) {
  e.preventDefault()
  const btn = this.querySelector('[type="submit"]')
  btn.disabled = true; btn.textContent = 'Sending...'
  const data = Object.fromEntries(new FormData(this))
  try {
    const res = await fetch('/contact', { method: 'POST', headers: {'Content-Type':'application/json','Accept':'application/json'}, body: JSON.stringify(data) })
    if (res.ok) {
      const name = data.name ? data.name.split(' ')[0] : ''
      const industry = (${JSON.stringify(contentJson?.props?.industry || '')} || '').toLowerCase()
      const isLegal = /law|legal|attorney|solicitor|counsel|barrister/.test(industry)
      const isMedical = /medical|clinic|health|dental|therapy|physio|wellness/.test(industry)
      const isHospitality = /restaurant|cafe|hotel|hospitality|catering|food|dining/.test(industry)
      const isFitness = /fitness|gym|yoga|nutrition|coach|pilates|personal trainer/.test(industry)
      const isConstruction = /construction|property|real estate|building|contractor|trades/.test(industry)
      const isFinance = /finance|accounting|investment|wealth|insurance|bank|financial/.test(industry)
      const confirmMsg = isLegal ? 'Your enquiry has been received. A member of our team will be in contact within one business day.' :
        isMedical ? 'Thank you for reaching out. Our team will be in touch to arrange a consultation.' :
        isHospitality ? "We've received your message and we're looking forward to hearing more. We'll be in touch very soon!" :
        isFitness ? "You're all set! We'll reach out shortly to discuss your goals." :
        isConstruction ? 'Message received. We\'ll be in touch with the details you need.' :
        isFinance ? 'Your enquiry has been noted. One of our advisors will follow up with you shortly.' :
        "Your message is on its way. We'll get back to you soon."
      this.innerHTML = \`<div style="text-align:center;padding:2rem 1rem">
        <div style="font-size:1.5rem;margin-bottom:0.75rem">✓</div>
        <p style="font-size:1rem;font-weight:600;color:${T.primary};margin-bottom:0.5rem">\${name ? 'Thank you, ' + name + '.' : 'Thank you.'}</p>
        <p style="opacity:0.65;font-size:0.9rem;line-height:1.6">\${confirmMsg}</p>
      </div>\`
    }
  } catch(err) {
    btn.disabled = false; btn.textContent = 'Send Message'
  }
})

// Scroll reveal animations
const revealEls = document.querySelectorAll('.scroll-reveal, section, .card-reveal')
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target) }
  })
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
revealEls.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'; observer.observe(el) })

// Analytics ping
fetch('/ping', { method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ path: window.location.pathname, referrer: document.referrer })
}).catch(()=>{});

// Subscribe form handler
document.querySelectorAll('[data-subscribe-form]').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('[data-email]')?.value;
    if (!email) return;
    const btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Joining...'; }
    try {
      const res = await fetch('/subscribe', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, name: form.querySelector('[data-name]')?.value })
      });
      if (res.ok) {
        form.innerHTML = \`<p style="color:${T.primary};padding:1rem;text-align:center;font-size:0.95rem">${
          T.bg === '#0D1B2A' ? '✓ Thank you. You will hear from us shortly.' :
          T.fontHeading?.includes('Lora') ? "✓ You're on the list — we'll be in touch soon!" :
          T.bg === '#F7F9F4' ? '✓ Welcome! Check your inbox for what comes next.' :
          T.bg === '#1A1A18' ? '✓ Received. We\'ll be in contact shortly.' :
          "✓ You're on the list!"
        }</p>\`
      }
    } catch(e) {
      if (btn) { btn.disabled = false; btn.textContent = 'Join'; }
    }
  });
});
</script>
</body>
</html>`
}

// ─── Component renderer ───────────────────────────────────────────────────────

function renderComponents(node, T) {
  if (!node) return ''
  if (typeof node === 'string') return escapeHtml(node)
  if (Array.isArray(node)) return node.map(n => renderComponents(n, T)).join('\n')

  const { type, props = {}, children = [] } = node
  if (!type) return ''

  const childHtml = renderComponents(children, T)
  const pc = T.primary
  const isDark = T.bg.startsWith('#0') || T.bg.startsWith('#1') || T.bg.startsWith('#09')
  const overlayBorder = isDark ? 'rgba(255,255,255,0.1)' : T.borderSubtle
  const overlayBg = isDark ? 'rgba(255,255,255,0.04)' : T.cardBg
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
  // Determine button text color based on primary brightness (not page bg)
  const btnTextColor = (() => { try { const h=pc.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return (r*299+g*587+b*114)/1000 > 155 ? '#111' : '#fff' } catch(e){return '#fff'} })()

  switch (type) {
    // ── Layout ──────────────────────────────────────────────────────────────
    case 'nav': {
      const navId = `nav_${Math.random().toString(36).slice(2,7)}`
      return `<nav style="display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem;border-bottom:1px solid ${T.navBorder};position:sticky;top:0;z-index:100;background:${T.bg};${props.style||''}">
  <div style="font-weight:${T.headingWeight};font-size:1.1rem;font-family:${T.fontHeading};color:${pc};${T.headingTracking};white-space:nowrap">${escapeHtml(props.brand||'')}</div>
  
  <!-- Desktop nav -->
  <div class="${navId}-desktop" style="display:flex;gap:1.25rem;align-items:center">${childHtml}</div>
  
  <!-- Mobile hamburger -->
  <button class="${navId}-btn" onclick="document.getElementById('${navId}').style.display=document.getElementById('${navId}').style.display==='flex'?'none':'flex'"
    style="display:none;background:none;border:none;cursor:pointer;padding:0.25rem;color:${T.text}">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  </button>
  
  <!-- Mobile menu -->
  <div id="${navId}" style="display:none;flex-direction:column;gap:0;position:absolute;top:100%;left:0;right:0;background:${T.bg};border-bottom:1px solid ${T.navBorder};padding:1rem 2rem;z-index:99">
    ${childHtml}
  </div>
</nav>
<style>
  @media (max-width: 768px) {
    .${navId}-desktop { display: none !important; }
    .${navId}-btn { display: block !important; }
    #${navId} a { display: block; padding: 0.75rem 0; border-bottom: 1px solid ${T.borderSubtle}; font-size: 1rem; }
    #${navId} a:last-child { border-bottom: none; }
  }
</style>`
    }

    case 'section': return `<section${props.id ? ` id="${escapeAttr(props.id)}"` : ''} style="max-width:${props.max_width||'1100px'};margin:${props.margin||'0 auto'};padding:${props.padding||T.sectionPadding};${props.style||''}">${childHtml}</section>`

    case 'hero': {
      const align = props.align || T.heroAlign
      let subtitleHtml = ''
      if (props.subtitle) {
        const baseStyle = `font-size:1.15rem;line-height:1.8;opacity:0.75;max-width:620px;${align==='center'?'margin:0 auto 2.5rem':'margin-bottom:2.5rem'}`
        if (props.subtitle_animation === 'typewriter') {
          const id = `tw_${Math.random().toString(36).slice(2,8)}`
          subtitleHtml = `<p id="${id}" style="${baseStyle};min-height:2em"></p>
<script>(function(){var el=document.getElementById('${id}');var txt=${JSON.stringify(props.subtitle)};var i=0;function type(){if(i<txt.length){el.textContent+=txt[i++];setTimeout(type,28);}};setTimeout(type,400);})()</script>`
        } else if (props.subtitle_animation === 'fade') {
          subtitleHtml = `<p style="${baseStyle};opacity:0;animation:fadeIn 1s ease 0.4s forwards">${escapeHtml(props.subtitle)}</p><style>@keyframes fadeIn{to{opacity:.75}}</style>`
        } else {
          subtitleHtml = `<p style="${baseStyle}">${escapeHtml(props.subtitle)}</p>`
        }
      }
      // Render bullets if provided
      const bulletsHtml = Array.isArray(props.bullets) && props.bullets.length
        ? `<ul style="list-style:none;padding:0;margin:0 auto 2rem;max-width:520px;text-align:left;display:inline-block">${props.bullets.map((b) => `<li style="display:flex;align-items:flex-start;gap:0.6rem;margin-bottom:0.6rem;font-size:1rem;opacity:0.9"><span style="color:${pc};font-size:1.1rem;line-height:1.4">✓</span><span>${escapeHtml(b)}</span></li>`).join('')}</ul>`
        : ''

      // Inline subscribe form if show_form is true
      // Determine readable button text color based on primary brightness
      const btnFg = (() => { try { const h=pc.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return (r*299+g*587+b*114)/1000 > 155 ? '#111' : '#fff' } catch(e){return '#fff'} })()
      const heroFormHtml = props.show_form
        ? `<form data-subscribe-form style="display:flex;flex-direction:column;gap:0.75rem;max-width:440px;${align==='center'?'margin:0 auto':'margin:0'};width:100%;text-align:left">
            <input type="text" name="name" placeholder="Your name" required style="padding:0.875rem 1rem;border:1px solid ${T.border};border-radius:${T.radius};background:${T.cardBg};color:${T.text};font-size:1rem;width:100%;box-sizing:border-box;font-family:inherit">
            <input type="email" name="email" placeholder="Your email" required style="padding:0.875rem 1rem;border:1px solid ${T.border};border-radius:${T.radius};background:${T.cardBg};color:${T.text};font-size:1rem;width:100%;box-sizing:border-box;font-family:inherit">
            <button type="submit" style="padding:0.95rem;background:${pc};color:${btnFg};border:none;border-radius:${T.btnRadius};font-size:1rem;font-weight:700;cursor:pointer;width:100%;font-family:inherit;letter-spacing:0.01em">${escapeHtml(props.cta_label || 'Get Started')}</button>
           </form>`
        : ''

      const heroMaxWidth = align === 'center' ? '860px' : '780px'
      const heroMargin = align === 'center' ? '0 auto' : '0 auto'
      return `<div style="text-align:${align};max-width:${heroMaxWidth};margin:${heroMargin};padding:5rem 2rem 4rem;${props.style||''}">
  ${props.eyebrow ? `<p style="${T.eyebrowStyle}color:${pc};margin-bottom:1.25rem">${escapeHtml(props.eyebrow)}</p>` : ''}
  ${props.headline ? `<h1 style="font-size:clamp(2.2rem,5.5vw,4rem);font-weight:${T.headingWeight};line-height:1.1;${T.headingTracking};font-family:${T.fontHeading};margin-bottom:1.5rem">${escapeHtml(props.headline)}</h1>` : ''}
  ${subtitleHtml}
  ${bulletsHtml}
  ${heroFormHtml}
  ${childHtml}
</div>`
    }

    case 'grid': {
      const cols = props.columns
      const gridCols = typeof cols === 'number' ? `repeat(${cols},1fr)` : (cols || 'repeat(auto-fit,minmax(280px,1fr))')
      return `<div style="display:grid;grid-template-columns:${gridCols};gap:${props.gap||'2rem'};${props.style||''}">${childHtml}</div>`
    }

    case 'flex': return `<div style="display:flex;gap:${props.gap||'1rem'};align-items:${props.align||'center'};justify-content:${props.justify||'flex-start'};flex-wrap:${props.wrap||'wrap'};${props.style||''}">${childHtml}</div>`

    case 'card': {
      // Determine if background is dark (need light text) or light (need dark text)
      const isDarkCard = T.bg.startsWith('#0') || T.bg.startsWith('#1') || T.bg.startsWith('#2') || T.cardBg.includes('rgba(255,255,255,0.0') || T.cardBg.includes('rgba(255,255,255,0.1')
      const cardTextColor = isDarkCard ? T.text : 'inherit'
      const cardInner = childHtml || [
        props.icon ? `<div style="font-size:2rem;margin-bottom:1rem;color:${pc}">${escapeHtml(props.icon)}</div>` : '',
        props.title ? `<h3 style="font-size:1.05rem;font-weight:700;font-family:${T.fontHeading};margin-bottom:0.5rem;color:${cardTextColor}">${escapeHtml(props.title)}</h3>` : '',
        props.description ? `<p style="font-size:0.95rem;line-height:1.7;margin:0;color:${cardTextColor};opacity:0.85">${escapeHtml(props.description)}</p>` : '',
      ].join('')
      return `<div style="background:${T.cardBg};border:1px solid ${T.borderSubtle};border-radius:${T.radiusLg};padding:${props.padding||'2rem'};box-shadow:${T.shadow};color:${cardTextColor};${props.style||''}">${cardInner}</div>`
    }

    case 'divider': return `<hr style="border:none;border-top:1px solid ${T.borderSubtle};margin:${props.margin||'3rem 0'}">`

    case 'spacer': return `<div style="height:${props.height||'2rem'}"></div>`

    // ── Typography ───────────────────────────────────────────────────────────
    case 'h1': return `<h1 style="font-size:${props.size||'2.5rem'};font-weight:${T.headingWeight};font-family:${T.fontHeading};${T.headingTracking};line-height:1.1;${props.style||''}">${childHtml||escapeHtml(props.text||'')}</h1>`
    case 'h2': return `<h2 style="font-size:${props.size||'2rem'};font-weight:${T.headingWeight};font-family:${T.fontHeading};${T.headingTracking};line-height:1.15;${props.style||''}">${childHtml||escapeHtml(props.text||'')}</h2>`
    case 'h3': return `<h3 style="font-size:${props.size||'1.3rem'};font-weight:600;font-family:${T.fontHeading};line-height:1.3;${props.style||''}">${childHtml||escapeHtml(props.text||'')}</h3>`
    case 'p': return `<p style="line-height:1.75;opacity:0.85;${props.style||''}">${childHtml||escapeHtml(props.text||'')}</p>`
    case 'text': return `<span style="${props.style||''}">${escapeHtml(props.text||'')}</span>`
    case 'label': return `<p style="${T.eyebrowStyle}opacity:0.6;${props.style||''}">${escapeHtml(props.text||'')}</p>`

    // ── Media ────────────────────────────────────────────────────────────────
    case 'image': return `<img src="${escapeAttr(props.src||'')}" alt="${escapeAttr(props.alt||'')}" style="border-radius:${props.radius||T.radius};${props.style||''}">`
    case 'video': return `<video src="${escapeAttr(props.src||'')}" ${props.autoplay?'autoplay muted loop':''} ${props.controls?'controls':''} style="width:100%;border-radius:${T.radius};${props.style||''}"></video>`
    case 'icon': return `<span style="font-size:${props.size||'2rem'}">${escapeHtml(props.emoji||'')}</span>`

    // ── Buttons & Links ──────────────────────────────────────────────────────
    case 'button': {
      const isOutline = props.variant === 'outline'
      const isGhost = props.variant === 'ghost'
      const bg = isOutline || isGhost ? 'transparent' : pc
      const color = isOutline ? pc : isGhost ? T.text : btnTextColor
      const border = isOutline ? `2px solid ${pc}` : isGhost ? `1px solid ${T.borderSubtle}` : 'none'
      return `<a href="${escapeAttr(props.href||'#')}" style="display:inline-block;background:${bg};color:${color};border:${border};padding:${props.padding||'0.85rem 2.2rem'};border-radius:${T.btnRadius};font-weight:600;text-decoration:none;font-size:${props.size||'1rem'};cursor:pointer;transition:opacity 0.2s;${props.style||''}" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">${escapeHtml(props.label||'')}</a>`
    }

    case 'link': return `<a href="${escapeAttr(props.href||'#')}" style="${props.style||''}">${childHtml||escapeHtml(props.label||props.text||'')}</a>`

    // ── Forms ────────────────────────────────────────────────────────────────
    case 'subscribe_form': {
  const showName = props.show_name !== false
  const showWhatsapp = props.show_whatsapp === true
  return `<form data-subscribe-form style="display:flex;flex-direction:column;gap:0.75rem;max-width:${props.max_width||'440px'};margin:${props.margin||'0 auto'};width:100%;${props.style||''}">
    ${showName ? `<input type="text" name="name" placeholder="Your name" required style="padding:0.875rem 1rem;border:1px solid rgba(255,255,255,0.2);border-radius:8px;background:rgba(255,255,255,0.1);color:inherit;font-size:1rem;width:100%;box-sizing:border-box;font-family:inherit">` : ''}
    <input type="email" name="email" placeholder="${escapeAttr(props.placeholder||'Your email')}" required style="padding:0.875rem 1rem;border:1px solid rgba(255,255,255,0.2);border-radius:8px;background:rgba(255,255,255,0.1);color:inherit;font-size:1rem;width:100%;box-sizing:border-box;font-family:inherit">
    ${showWhatsapp ? `<input type="tel" name="whatsapp" placeholder="WhatsApp number (optional)" style="padding:0.875rem 1rem;border:1px solid rgba(255,255,255,0.2);border-radius:8px;background:rgba(255,255,255,0.1);color:inherit;font-size:1rem;width:100%;box-sizing:border-box;font-family:inherit">` : ''}
    <button type="submit" style="padding:0.875rem;background:var(--primary);color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;width:100%;font-family:inherit">${escapeHtml(props.button_label||'Subscribe')}</button>
  </form>`
}

    case 'contact_form': return `<form action="/contact" method="POST" style="display:flex;flex-direction:column;gap:1rem;max-width:${props.max_width||'500px'};${props.style||''}">
  <input name="name" type="text" placeholder="Your name" style="background:${inputBg};border:1px solid ${inputBorder};border-radius:${T.radius};padding:0.85rem 1.1rem;color:inherit;font-family:inherit">
  <input name="email" type="email" placeholder="Email address" required style="background:${inputBg};border:1px solid ${inputBorder};border-radius:${T.radius};padding:0.85rem 1.1rem;color:inherit;font-family:inherit">
  <textarea name="message" rows="4" placeholder="Message" style="background:${inputBg};border:1px solid ${inputBorder};border-radius:${T.radius};padding:0.85rem 1.1rem;color:inherit;resize:vertical;font-family:inherit"></textarea>
  <button type="submit" style="background:${pc};color:${btnTextColor};border:none;border-radius:${T.btnRadius};padding:0.9rem;font-weight:700;cursor:pointer;font-family:inherit">Send Message</button>
</form>`

    // ── Features / Pricing ───────────────────────────────────────────────────
    case 'feature': {
      // Resolve icon: use title+description as keyword context if icon is generic emoji
      const iconContext = (props.icon || '') + ' ' + (props.title || '') + ' ' + (props.description || '')
      const featureIcon = iconSvg(iconContext, T.statValueColor || pc, 28)
      return `<div style="padding:${props.padding||'0'};${props.style||''}">
  ${props.icon !== undefined ? `<div style="margin-bottom:1.25rem;opacity:0.9">${featureIcon}</div>` : ''}
  ${props.title ? `<h3 style="font-size:1.05rem;font-weight:600;font-family:${T.fontHeading};margin-bottom:0.6rem;color:${T.text}">${escapeHtml(props.title)}</h3>` : ''}
  ${props.description ? `<p style="opacity:0.85;line-height:1.7;font-size:0.95rem;color:${T.text}">${escapeHtml(props.description)}</p>` : ''}
  ${childHtml}
</div>`
    }

    case 'pricing_card': return `<div style="background:${props.featured?T.muted:T.cardBg};border:${props.featured?`2px solid ${pc}`:`1px solid ${T.borderSubtle}`};border-radius:${T.radiusLg};padding:2.5rem;box-shadow:${props.featured?T.shadow:'none'};${props.style||''}">
  ${props.plan ? `<p style="${T.eyebrowStyle}color:${pc};margin-bottom:0.75rem">${escapeHtml(props.plan)}</p>` : ''}
  ${props.price ? `<div style="font-size:3rem;font-weight:${T.headingWeight};font-family:${T.fontHeading};margin:0.75rem 0;${T.headingTracking}">${escapeHtml(props.price)}<span style="font-size:1rem;font-weight:400;opacity:0.5">${escapeHtml(props.period||'/mo')}</span></div>` : ''}
  ${props.description ? `<p style="opacity:0.65;margin-bottom:1.5rem;font-size:0.95rem">${escapeHtml(props.description)}</p>` : ''}
  ${childHtml}
</div>`

    case 'bullet_list': {
      const items = props.items || []
      return `<ul style="list-style:none;${props.style||''}">
  ${items.map(item => `<li style="display:flex;align-items:flex-start;gap:0.8rem;margin-bottom:0.8rem;line-height:1.6">
    <span style="color:${pc};flex-shrink:0;margin-top:0.1rem">✓</span>
    <span style="opacity:0.85">${escapeHtml(typeof item === 'string' ? item : item.text || '')}</span>
  </li>`).join('')}
</ul>`
    }

    // ── Social proof ─────────────────────────────────────────────────────────
    case 'testimonial': return `<div style="background:${T.cardBg};border:1px solid ${T.borderSubtle};border-radius:${T.radiusLg};padding:2.5rem;box-shadow:${T.shadow};${props.style||''}">
  ${props.quote ? `<p style="font-size:1.05rem;line-height:1.8;font-style:italic;margin-bottom:1.75rem;opacity:0.9">"${escapeHtml(props.quote)}"</p>` : ''}
  <div style="display:flex;align-items:center;gap:0.9rem">
    ${props.avatar ? `<img src="${escapeAttr(props.avatar)}" style="width:42px;height:42px;border-radius:50%;object-fit:cover">` : `<div style="width:42px;height:42px;border-radius:50%;background:${pc};display:flex;align-items:center;justify-content:center;font-weight:700;font-family:${T.fontHeading}">${escapeHtml((props.name||'?')[0])}</div>`}
    <div>
      <p style="font-weight:600;font-size:0.95rem">${escapeHtml(props.name||'')}</p>
      ${props.title ? `<p style="font-size:0.82rem;opacity:0.55;margin-top:0.15rem">${escapeHtml(props.title)}</p>` : ''}
    </div>
  </div>
</div>`

    case 'stat': return `<div style="text-align:center;${props.style||''}">
  <div style="font-size:${props.value_size||'3.5rem'};font-weight:${T.headingWeight};color:${T.statValueColor};font-family:${T.fontHeading};${T.headingTracking};line-height:1">${escapeHtml(props.value||'')}</div>
  <div style="opacity:0.6;margin-top:0.5rem;font-size:0.9rem">${escapeHtml(props.label||'')}</div>
</div>`

    // ── Navigation ───────────────────────────────────────────────────────────
    case 'nav_link': return `<a href="${escapeAttr(props.href||'#')}" style="color:inherit;text-decoration:none;opacity:0.75;font-size:0.9rem;transition:opacity 0.2s;${props.style||''}" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.75'">${escapeHtml(props.label||'')}</a>`

    case 'nav_cta': return `<a href="${escapeAttr(props.href||'#')}" style="background:${pc};color:${btnTextColor};padding:0.5rem 1.4rem;border-radius:${T.btnRadius};text-decoration:none;font-weight:600;font-size:0.9rem;${props.style||''}">${escapeHtml(props.label||'')}</a>`

    // ── Footer ───────────────────────────────────────────────────────────────
    case 'footer': return `<footer style="border-top:1px solid ${T.borderSubtle};padding:3rem 2.5rem;margin-top:6rem;${props.style||''}">
  <div style="max-width:1100px;margin:0 auto">
    ${childHtml}
    ${props.copyright ? `<p style="opacity:0.35;font-size:0.82rem;margin-top:2rem">${escapeHtml(props.copyright)}</p>` : ''}
  </div>
</footer>`

    // ── How It Works (numbered steps) ────────────────────────────────────────
    case 'steps': {
      const steps = props.steps || []
      return `<div style="${props.style||''}">
        ${steps.map((step, i) => `
          <div class="scroll-reveal" style="display:flex;gap:2rem;align-items:flex-start;margin-bottom:${i < steps.length-1 ? '3rem' : '0'};${i % 2 === 1 ? 'flex-direction:row-reverse' : ''}">
            <div style="flex-shrink:0;width:3.5rem;height:3.5rem;border-radius:50%;background:${pc};color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;font-family:${T.fontHeading};margin-top:0.25rem">${String(i+1).padStart(2,'0')}</div>
            <div>
              <h3 style="font-size:1.15rem;font-weight:600;font-family:${T.fontHeading};margin-bottom:0.5rem;${T.headingTracking}">${escapeHtml(step.title||'')}</h3>
              <p style="opacity:0.7;line-height:1.75;font-size:0.95rem;max-width:520px">${escapeHtml(step.description||'')}</p>
            </div>
          </div>
          ${i < steps.length-1 ? `<div style="width:1px;height:2rem;background:${T.borderSubtle};margin-left:1.75rem;margin-bottom:0"></div>` : ''}
        `).join('')}
      </div>`
    }

    // ── Comparison table ─────────────────────────────────────────────────────
    case 'comparison': {
      const rows = props.rows || []
      const col1 = props.col1 || 'Traditional'
      const col2 = props.col2 || 'Us'
      return `<div class="scroll-reveal" style="overflow-x:auto;${props.style||''}">
        <table style="width:100%;border-collapse:collapse;font-size:0.95rem">
          <thead>
            <tr>
              <th style="text-align:left;padding:1rem 1.5rem;border-bottom:1px solid ${T.border};opacity:0.5;font-weight:500"></th>
              <th style="text-align:center;padding:1rem 1.5rem;border-bottom:1px solid ${T.border};opacity:0.6;font-weight:500">${escapeHtml(col1)}</th>
              <th style="text-align:center;padding:1rem 1.5rem;border-bottom:1px solid ${T.border};color:${pc};font-weight:700;background:${T.muted};border-radius:${T.radius} ${T.radius} 0 0">${escapeHtml(col2)}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, i) => `
              <tr style="border-bottom:1px solid ${T.borderSubtle}">
                <td style="padding:0.9rem 1.5rem;font-weight:500">${escapeHtml(row.label||'')}</td>
                <td style="text-align:center;padding:0.9rem 1.5rem;opacity:0.5">${escapeHtml(row.before||'✗')}</td>
                <td style="text-align:center;padding:0.9rem 1.5rem;background:${T.muted};color:${pc};font-weight:600">${escapeHtml(row.after||'✓')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`
    }

    // ── Pricing table ─────────────────────────────────────────────────────────
    case 'pricing': {
      const plans = props.plans || []
      return `<div class="scroll-reveal" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem;${props.style||''}">
        ${plans.map(plan => `
          <div style="background:${plan.featured ? T.muted : T.cardBg};border:${plan.featured ? `2px solid ${pc}` : `1px solid ${T.borderSubtle}`};border-radius:${T.radiusLg};padding:2.5rem;position:relative;${plan.featured ? `box-shadow:${T.shadow}` : ''}">
            ${plan.badge ? `<div style="position:absolute;top:-0.75rem;left:50%;transform:translateX(-50%);background:${pc};color:#fff;font-size:0.75rem;font-weight:700;padding:0.25rem 1rem;border-radius:999px;white-space:nowrap">${escapeHtml(plan.badge)}</div>` : ''}
            <p style="${T.eyebrowStyle}color:${pc};margin-bottom:0.75rem">${escapeHtml(plan.name||'')}</p>
            <div style="font-size:2.75rem;font-weight:${T.headingWeight};font-family:${T.fontHeading};margin:0.5rem 0;${T.headingTracking}">${escapeHtml(plan.price||'')}<span style="font-size:1rem;font-weight:400;opacity:0.5">${escapeHtml(plan.period||'/mo')}</span></div>
            <p style="opacity:0.6;margin-bottom:1.75rem;font-size:0.9rem;line-height:1.6">${escapeHtml(plan.description||'')}</p>
            <ul style="list-style:none;margin-bottom:2rem">
              ${(plan.features||[]).map(f => `<li style="display:flex;align-items:flex-start;gap:0.6rem;margin-bottom:0.6rem;font-size:0.9rem"><span style="color:${pc};flex-shrink:0">✓</span><span style="opacity:0.8">${escapeHtml(f)}</span></li>`).join('')}
            </ul>
            <a href="${escapeAttr(plan.cta_href||'#contact')}" style="display:block;text-align:center;background:${plan.featured ? pc : 'transparent'};color:${plan.featured ? '#fff' : pc};border:2px solid ${pc};padding:0.85rem;border-radius:${T.btnRadius};font-weight:600;text-decoration:none;font-size:0.95rem;transition:opacity 0.2s" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">${escapeHtml(plan.cta||'Get Started')}</a>
          </div>
        `).join('')}
      </div>`
    }

    // ── Logo bar (trust signals) ──────────────────────────────────────────────
    case 'logo_bar': {
      const logos = props.logos || []
      return `<div class="scroll-reveal" style="text-align:center;${props.style||''}">
        ${props.label ? `<p style="opacity:0.4;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1.5rem">${escapeHtml(props.label)}</p>` : ''}
        <div style="display:flex;gap:2.5rem;align-items:center;justify-content:center;flex-wrap:wrap;opacity:0.4">
          ${logos.map(l => `<span style="font-size:1rem;font-weight:600;font-family:${T.fontHeading};letter-spacing:-0.02em">${escapeHtml(typeof l === 'string' ? l : l.name || '')}</span>`).join('')}
        </div>
      </div>`
    }

    // ── Raw HTML ─────────────────────────────────────────────────────────────
    case 'html': return props.content || ''

    // ── Dynamic: Directory ───────────────────────────────────────────────────
    case 'directory': {
      const cats = props.categories || []
      const emptyText = escapeHtml(props.empty_text || 'No listings found.')
      const dirTitle = escapeHtml(props.title || 'Directory')
      const catsJson = JSON.stringify(cats)
      return `
<div id="directory-root" style="padding:2rem 0">
  <h2 style="font-size:1.6rem;font-weight:700;font-family:${T.fontHeading};margin-bottom:1.5rem">${dirTitle}</h2>
  <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1.25rem;align-items:center">
    ${props.show_search !== false ? `<input id="dir-search" placeholder="Search…" oninput="dirFilter()" style="padding:0.6rem 1rem;border:1px solid ${T.borderSubtle};border-radius:${T.btnRadius};font-size:0.9rem;background:${T.cardBg};color:${T.text};flex:1;min-width:180px">` : ''}
    ${props.show_category_filter !== false && cats.length ? `<select id="dir-cat" onchange="dirFilter()" style="padding:0.6rem 1rem;border:1px solid ${T.borderSubtle};border-radius:${T.btnRadius};font-size:0.9rem;background:${T.cardBg};color:${T.text}"><option value="">All categories</option>${cats.map(c=>`<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join('')}</select>` : ''}
    ${props.show_location_filter ? `<input id="dir-location" placeholder="Location…" oninput="dirFilter()" style="padding:0.6rem 1rem;border:1px solid ${T.borderSubtle};border-radius:${T.btnRadius};font-size:0.9rem;background:${T.cardBg};color:${T.text};width:160px">` : ''}
  </div>
  <div id="dir-count" style="font-size:0.85rem;color:${T.textMuted || '#999'};margin-bottom:1rem"></div>
  <div id="dir-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem"></div>
  <div id="dir-empty" style="display:none;text-align:center;padding:3rem;color:${T.textMuted || '#999'};font-size:0.95rem">${emptyText}</div>
  <div id="dir-loading" style="text-align:center;padding:2rem;color:${T.textMuted || '#999'}">Loading…</div>
</div>
<script>
(function(){
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '${T.primary}';
  const cardBg = '${T.cardBg}'; const border = '${T.borderSubtle}'; const radius = '${T.radiusLg}'; const shadow = '${T.shadow}';
  let allListings = [];

  function buildParams() {
    const p = new URLSearchParams();
    const s = document.getElementById('dir-search')?.value?.trim();
    const c = document.getElementById('dir-cat')?.value;
    const l = document.getElementById('dir-location')?.value?.trim();
    if (s) p.set('search', s);
    if (c) p.set('category', c);
    if (l) p.set('location', l);
    p.set('limit', '100');
    return p.toString();
  }

  function renderCard(item) {
    const tags = (item.tags || []).map(t => \`<span style="font-size:0.72rem;padding:2px 8px;border-radius:999px;background:\${primary}22;color:\${primary};margin-right:4px">\${t}</span>\`).join('');
    const loc = item.location ? \`<div style="font-size:0.8rem;opacity:0.6;margin:4px 0">📍 \${item.location}</div>\` : '';
    const cat = item.category ? \`<div style="font-size:0.75rem;font-weight:600;color:\${primary};margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">\${item.category}</div>\` : '';
    const desc = item.description ? \`<p style="font-size:0.85rem;line-height:1.6;opacity:0.8;margin:8px 0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">\${item.description}</p>\` : '';
    const badge = item.featured ? \`<span style="font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:999px;background:\${primary};color:#fff;float:right">Featured</span>\` : '';
    return \`<div style="background:\${cardBg};border:1px solid \${border};border-radius:\${radius};padding:1.5rem;box-shadow:\${shadow};transition:transform 0.15s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">\${badge}\${cat}<h3 style="font-size:1.05rem;font-weight:700;margin:0 0 4px">\${item.title}</h3>\${loc}\${desc}<div style="margin-top:8px">\${tags}</div></div>\`;
  }

  function dirFilter() {
    const s = (document.getElementById('dir-search')?.value||'').toLowerCase();
    const c = document.getElementById('dir-cat')?.value || '';
    const l = (document.getElementById('dir-location')?.value||'').toLowerCase();
    const filtered = allListings.filter(item => {
      if (c && item.category !== c) return false;
      if (l && !(item.location||'').toLowerCase().includes(l)) return false;
      if (s && !(item.title+' '+(item.description||'')).toLowerCase().includes(s)) return false;
      return true;
    });
    const grid = document.getElementById('dir-grid');
    const empty = document.getElementById('dir-empty');
    const count = document.getElementById('dir-count');
    grid.innerHTML = filtered.map(renderCard).join('');
    count.textContent = filtered.length + ' result' + (filtered.length !== 1 ? 's' : '');
    empty.style.display = filtered.length ? 'none' : 'block';
    grid.style.display = filtered.length ? 'grid' : 'none';
  }

  window.dirFilter = dirFilter;

  fetch('/api/listings?' + buildParams())
    .then(r => r.json())
    .then(d => {
      allListings = d.listings || [];
      document.getElementById('dir-loading').style.display = 'none';
      dirFilter();
    })
    .catch(() => {
      document.getElementById('dir-loading').textContent = 'Failed to load listings.';
    });
})();
</script>`
    }

    // ── Dynamic: Listing Submit Form ─────────────────────────────────────────
    case 'listing_submit_form': {
      const cats = props.categories || []
      const formTitle = escapeHtml(props.title || 'Submit Your Business')
      const successMsg = escapeHtml(props.success_message || 'Thanks! We will review your submission.')
      const priceId = escapeAttr(props.stripe_price_id || '')
      const successUrl = escapeAttr(props.checkout_success_url || '/thank-you')
      const cancelUrl = escapeAttr(props.checkout_cancel_url || '/')
      return `
<div id="listing-form-wrap" style="max-width:560px;margin:0 auto">
  <h2 style="font-size:1.5rem;font-weight:700;font-family:${T.fontHeading};margin-bottom:1.5rem">${formTitle}</h2>
  <form id="listing-form" onsubmit="submitListing(event)" style="display:flex;flex-direction:column;gap:1rem">
    <input name="title" placeholder="Business name *" required style="padding:0.75rem 1rem;border:1px solid ${T.borderSubtle};border-radius:${T.btnRadius};font-size:0.95rem;background:${T.cardBg};color:${T.text}">
    <select name="category" style="padding:0.75rem 1rem;border:1px solid ${T.borderSubtle};border-radius:${T.btnRadius};font-size:0.95rem;background:${T.cardBg};color:${T.text}">
      <option value="">Select category</option>
      ${cats.map(c=>`<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join('')}
    </select>
    <input name="location" placeholder="City, State" style="padding:0.75rem 1rem;border:1px solid ${T.borderSubtle};border-radius:${T.btnRadius};font-size:0.95rem;background:${T.cardBg};color:${T.text}">
    <textarea name="description" placeholder="Describe your business…" rows="4" style="padding:0.75rem 1rem;border:1px solid ${T.borderSubtle};border-radius:${T.btnRadius};font-size:0.95rem;background:${T.cardBg};color:${T.text};resize:vertical"></textarea>
    <input name="contact_email" type="email" placeholder="Contact email *" required style="padding:0.75rem 1rem;border:1px solid ${T.borderSubtle};border-radius:${T.btnRadius};font-size:0.95rem;background:${T.cardBg};color:${T.text}">
    <input name="website" placeholder="Website URL" style="padding:0.75rem 1rem;border:1px solid ${T.borderSubtle};border-radius:${T.btnRadius};font-size:0.95rem;background:${T.cardBg};color:${T.text}">
    <button type="submit" style="padding:0.85rem 2rem;background:var(--primary,${T.primary});color:#fff;border:none;border-radius:${T.btnRadius};font-size:1rem;font-weight:600;cursor:pointer">
      ${priceId ? 'Continue to Payment →' : 'Submit Listing'}
    </button>
    <div id="listing-form-msg" style="display:none;padding:1rem;border-radius:${T.btnRadius};text-align:center"></div>
  </form>
</div>
<script>
async function submitListing(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('[type=submit]');
  const msg = document.getElementById('listing-form-msg');
  btn.disabled = true; btn.textContent = 'Submitting…';
  const data = {
    title: form.title.value, category: form.category.value,
    location: form.location.value, description: form.description.value,
    contact: { email: form.contact_email.value, website: form.website.value }
  };
  try {
    const r = await fetch('/api/listings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Submission failed');
    const priceId = '${priceId}';
    if (priceId) {
      const cr = await fetch('/api/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ price_id: priceId, customer_email: form.contact_email.value, success_url: window.location.origin + '${successUrl}', cancel_url: window.location.origin + '${cancelUrl}', metadata: { listing_id: d.listing?.id } }) });
      const cd = await cr.json();
      if (cd.url) { window.location.href = cd.url; return; }
    }
    msg.style.display = 'block'; msg.style.background = '#dcfce7'; msg.style.color = '#166534';
    msg.textContent = '${successMsg}'; form.reset();
  } catch(err) {
    msg.style.display = 'block'; msg.style.background = '#fee2e2'; msg.style.color = '#991b1b';
    msg.textContent = err.message;
  }
  btn.disabled = false; btn.textContent = '${priceId ? 'Continue to Payment →' : 'Submit Listing'}';
}
</script>`
    }

    // ── Dynamic: Pricing Table with Stripe ──────────────────────────────────
    case 'pricing_table': {
      const plans = props.plans || []
      const successUrl = escapeAttr(props.checkout_success_url || '/thank-you')
      const cancelUrl = escapeAttr(props.checkout_cancel_url || '/')
      const plansHtml = plans.map(plan => {
        const featured = plan.featured
        const feats = (plan.features||[]).map(f=>`<li style="padding:6px 0;border-bottom:1px solid ${T.borderSubtle};font-size:0.9rem;display:flex;gap:8px;align-items:flex-start"><span style="color:${T.primary}">✓</span>${escapeHtml(f)}</li>`).join('')
        return `<div style="background:${featured?T.muted:T.cardBg};border:${featured?`2px solid ${T.primary}`:`1px solid ${T.borderSubtle}`};border-radius:${T.radiusLg};padding:2.5rem;position:relative">
          ${featured?`<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:${T.primary};color:#fff;font-size:0.75rem;font-weight:700;padding:4px 16px;border-radius:999px">Most Popular</div>`:''}
          <h3 style="font-size:1.3rem;font-weight:700;font-family:${T.fontHeading}">${escapeHtml(plan.name||'')}</h3>
          <div style="font-size:2rem;font-weight:800;margin:0.75rem 0;color:${T.primary}">${escapeHtml(plan.price||'')}</div>
          <ul style="list-style:none;padding:0;margin:1.5rem 0">${feats}</ul>
          <button onclick="startCheckout('${escapeAttr(plan.stripe_price_id||'')}','${successUrl}','${cancelUrl}')" style="width:100%;padding:0.85rem;background:${featured?T.primary:'transparent'};color:${featured?'#fff':T.primary};border:2px solid ${T.primary};border-radius:${T.btnRadius};font-size:1rem;font-weight:600;cursor:pointer">Get Started</button>
        </div>`
      }).join('')
      return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;align-items:start">${plansHtml}</div>
<script>
async function startCheckout(priceId, successUrl, cancelUrl) {
  if (!priceId) return alert('No price configured');
  try {
    const r = await fetch('/api/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ price_id: priceId, success_url: window.location.origin + successUrl, cancel_url: window.location.origin + cancelUrl }) });
    const d = await r.json();
    if (d.url) window.location.href = d.url;
    else alert(d.error || 'Checkout failed');
  } catch(e) { alert('Checkout error'); }
}
</script>`
    }

    // ── Fallback ─────────────────────────────────────────────────────────────
    default:
      if (childHtml) return `<div${props.style?` style="${escapeAttr(props.style)}"`:''} class="${escapeAttr(type)}">${childHtml}</div>`
      return `<div class="${escapeAttr(type)}"></div>`
  }
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function escapeAttr(str) {
  if (!str) return ''
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// ─── Blog renderers ───────────────────────────────────────────────────────────

function renderBlogPost(page, site, company) {
  const T = resolveTheme(site.theme || {})
  const content = page.content_json || {}
  const props = content.props || {}
  const children = content.children || []

  const title = props.title || page.title || 'Blog Post'
  const metaDesc = props.meta_description || ''
  const readingTime = props.reading_time || 5
  const ctaText = props.cta_text || `Get in touch with ${company.name} today.`
  const ctaUrl = props.cta_url || '/'

  // Render markdown children
  let articleBody = ''
  for (const child of children) {
    if (child.type === 'markdown' && child.props?.content) {
      articleBody += marked.parse(child.props.content)
    }
  }

  const isDark = T.bg.startsWith('#0') || T.bg.startsWith('#1') || T.bg.startsWith('#09')
  const publishedDate = page.published_at ? new Date(page.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)} | ${escapeHtml(company.name)}</title>
${metaDesc ? `<meta name="description" content="${escapeAttr(metaDesc)}">` : ''}
<meta property="og:title" content="${escapeAttr(title)}">
${metaDesc ? `<meta property="og:description" content="${escapeAttr(metaDesc)}">` : ''}
${seo.og_image ? `<meta property="og:image" content="${escapeAttr(seo.og_image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${escapeAttr(seo.og_image)}">
<meta name="twitter:title" content="${escapeAttr(title)}">
${metaDesc ? `<meta name="twitter:description" content="${escapeAttr(metaDesc)}">` : ''}` : '<meta name="twitter:card" content="summary">'}
${seo.og_url ? `<meta property="og:url" content="${escapeAttr(seo.og_url)}">` : ''}
<meta property="og:type" content="website">
${T.fontImport ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${T.fontImport}" rel="stylesheet">` : ''}
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root { --primary: ${T.primary}; --bg: ${T.bg}; --text: ${T.text}; --font: ${T.fontBody}; --radius: ${T.radius}; --border: ${T.borderSubtle}; --card-bg: ${T.cardBg}; }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.7; -webkit-font-smoothing: antialiased; }
  a { color: var(--primary); }
  nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; border-bottom: 1px solid ${T.navBorder}; position: sticky; top: 0; z-index: 100; background: ${T.bg}; }
  nav a { color: ${T.text}; text-decoration: none; opacity: 0.75; font-size: 0.9rem; }
  nav a:hover { opacity: 1; }
  .blog-hero { max-width: 780px; margin: 3.5rem auto 2.5rem; padding: 0 2rem; }
  .blog-hero h1 { font-family: ${T.fontHeading}; font-size: clamp(1.9rem, 4vw, 2.9rem); font-weight: ${T.headingWeight}; line-height: 1.15; ${T.headingTracking}; margin-bottom: 1.25rem; }
  .blog-meta { font-size: 0.88rem; opacity: 0.6; margin-bottom: 0.5rem; display: flex; gap: 1.25rem; flex-wrap: wrap; align-items: center; }
  .blog-meta span { display: flex; align-items: center; gap: 0.3rem; }
  .blog-desc { font-size: 1.1rem; opacity: 0.75; line-height: 1.75; margin-top: 1rem; border-left: 3px solid ${T.primary}; padding-left: 1.25rem; }
  .blog-body { max-width: 780px; margin: 0 auto 4rem; padding: 0 2rem; }
  .blog-body h2 { font-family: ${T.fontHeading}; font-size: clamp(1.4rem, 2.5vw, 1.8rem); font-weight: ${T.headingWeight}; line-height: 1.2; ${T.headingTracking}; margin: 2.5rem 0 1rem; }
  .blog-body h3 { font-family: ${T.fontHeading}; font-size: 1.2rem; font-weight: 600; margin: 2rem 0 0.75rem; }
  .blog-body p { margin-bottom: 1.4rem; opacity: 0.88; font-size: 1.05rem; }
  .blog-body ul, .blog-body ol { margin: 1rem 0 1.4rem 1.5rem; }
  .blog-body li { margin-bottom: 0.5rem; opacity: 0.88; font-size: 1.05rem; }
  .blog-body strong { font-weight: 700; }
  .blog-body em { font-style: italic; opacity: 0.9; }
  .blog-body blockquote { border-left: 3px solid ${T.primary}; padding: 0.75rem 1.25rem; margin: 1.5rem 0; opacity: 0.8; font-style: italic; background: ${T.cardBg}; border-radius: 0 ${T.radius} ${T.radius} 0; }
  .blog-body code { background: ${T.cardBg}; border: 1px solid ${T.borderSubtle}; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
  .blog-body pre { background: ${T.cardBg}; border: 1px solid ${T.borderSubtle}; padding: 1.25rem; border-radius: ${T.radius}; overflow-x: auto; margin-bottom: 1.4rem; }
  .blog-body pre code { background: none; border: none; padding: 0; }
  .blog-cta { max-width: 780px; margin: 0 auto 5rem; padding: 0 2rem; }
  .blog-cta-inner { background: ${T.muted}; border: 1px solid ${T.border}; border-radius: ${T.radiusLg}; padding: 2.5rem; text-align: center; }
  .blog-cta-inner h3 { font-family: ${T.fontHeading}; font-size: 1.4rem; font-weight: ${T.headingWeight}; margin-bottom: 0.75rem; }
  .blog-cta-inner p { opacity: 0.75; margin-bottom: 1.5rem; }
  .cta-btn { display: inline-block; background: ${T.primary}; color: ${isDark ? '#000' : '#fff'}; padding: 0.85rem 2.2rem; border-radius: ${T.btnRadius}; font-weight: 700; text-decoration: none; font-size: 1rem; transition: opacity 0.2s; }
  .cta-btn:hover { opacity: 0.85; }
  footer { border-top: 1px solid ${T.borderSubtle}; padding: 2rem; text-align: center; font-size: 0.85rem; opacity: 0.5; margin-top: 2rem; }
  @media (max-width: 640px) { .blog-hero, .blog-body, .blog-cta { padding: 0 1.25rem; } .blog-hero { margin-top: 2.5rem; } }
  ${T.customCss || ''}
</style>
</head>
<body>
<nav>
  <a href="/" style="font-weight:700;font-size:1.05rem;font-family:${T.fontHeading};color:${T.primary};${T.headingTracking}">${escapeHtml(company.name)}</a>
  <div style="display:flex;gap:1.25rem;align-items:center">
    <a href="/blog">Blog</a>
    <a href="/#contact" style="background:${T.primary};color:${isDark ? '#000' : '#fff'};padding:0.45rem 1.1rem;border-radius:${T.btnRadius};font-weight:600;font-size:0.85rem">Contact</a>
  </div>
</nav>

<div class="blog-hero">
  <div class="blog-meta">
    ${publishedDate ? `<span>📅 ${escapeHtml(publishedDate)}</span>` : ''}
    <span>⏱ ${readingTime} min read</span>
    <span>✍️ By ${escapeHtml(company.name)} AI Agent</span>
  </div>
  <h1>${escapeHtml(title)}</h1>
  ${metaDesc ? `<p class="blog-desc">${escapeHtml(metaDesc)}</p>` : ''}
</div>

<article class="blog-body">
  ${articleBody}
</article>

<div class="blog-cta">
  <div class="blog-cta-inner">
    <h3>Ready to take the next step?</h3>
    <p>${escapeHtml(ctaText)}</p>
    <a href="${escapeAttr(ctaUrl)}" class="cta-btn">Get a Free Consultation →</a>
  </div>
</div>

<footer>
  <a href="/blog" style="color:${T.primary};text-decoration:none;margin-right:1.5rem">← All Articles</a>
  © ${new Date().getFullYear()} ${escapeHtml(company.name)} · All rights reserved
</footer>

<script>
fetch('/ping', { method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ path: window.location.pathname, referrer: document.referrer })
}).catch(()=>{});
</script>
</body>
</html>`
}

function renderBlogListing(posts, site, company) {
  const T = resolveTheme(site.theme || {})
  const isDark = T.bg.startsWith('#0') || T.bg.startsWith('#1') || T.bg.startsWith('#09')

  const cardsHtml = posts.length === 0
    ? `<div style="grid-column:1/-1;text-align:center;padding:4rem 0;opacity:0.5">No blog posts yet — check back soon.</div>`
    : posts.map(post => {
        const props = post.content_json?.props || {}
        const title = props.title || post.title || 'Untitled'
        const excerpt = props.meta_description || ''
        const readingTime = props.reading_time || 5
        const date = post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
        const slug = post.path || `/blog/${post.slug}`
        return `<a href="${escapeAttr(slug)}" style="text-decoration:none;color:inherit;display:block">
  <div style="background:${T.cardBg};border:1px solid ${T.borderSubtle};border-radius:${T.radiusLg};padding:2rem;height:100%;transition:transform 0.15s,box-shadow 0.15s;box-shadow:${T.shadow}" onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 32px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='';this.style.boxShadow='${T.shadow}'">
    <div style="font-size:0.8rem;opacity:0.5;margin-bottom:0.75rem;display:flex;gap:1rem">
      ${date ? `<span>${escapeHtml(date)}</span>` : ''}
      <span>⏱ ${readingTime} min read</span>
    </div>
    <h2 style="font-family:${T.fontHeading};font-size:1.2rem;font-weight:${T.headingWeight};line-height:1.3;${T.headingTracking};margin-bottom:0.75rem;color:${T.text}">${escapeHtml(title)}</h2>
    ${excerpt ? `<p style="font-size:0.92rem;opacity:0.7;line-height:1.6;margin-bottom:1rem;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${escapeHtml(excerpt)}</p>` : ''}
    <span style="font-size:0.88rem;font-weight:600;color:${T.primary}">Read article →</span>
  </div>
</a>`
      }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog | ${escapeHtml(company.name)}</title>
<meta name="description" content="Articles, insights and updates from ${escapeHtml(company.name)}.">
${T.fontImport ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${T.fontImport}" rel="stylesheet">` : ''}
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root { --primary: ${T.primary}; --bg: ${T.bg}; --text: ${T.text}; }
  html { scroll-behavior: smooth; }
  body { font-family: ${T.fontBody}; background: ${T.bg}; color: ${T.text}; line-height: 1.6; -webkit-font-smoothing: antialiased; }
  a { color: ${T.primary}; }
  nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; border-bottom: 1px solid ${T.navBorder}; position: sticky; top: 0; z-index: 100; background: ${T.bg}; }
  nav a { color: ${T.text}; text-decoration: none; opacity: 0.75; font-size: 0.9rem; }
  nav a:hover { opacity: 1; }
  .blog-header { max-width: 1100px; margin: 4rem auto 3rem; padding: 0 2rem; }
  .blog-header h1 { font-family: ${T.fontHeading}; font-size: clamp(2rem, 4vw, 3rem); font-weight: ${T.headingWeight}; ${T.headingTracking}; margin-bottom: 0.75rem; }
  .blog-header p { opacity: 0.65; font-size: 1.05rem; }
  .blog-grid { max-width: 1100px; margin: 0 auto 5rem; padding: 0 2rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.75rem; }
  footer { border-top: 1px solid ${T.borderSubtle}; padding: 2rem; text-align: center; font-size: 0.85rem; opacity: 0.5; }
  @media (max-width: 640px) { .blog-header, .blog-grid { padding: 0 1.25rem; } .blog-header { margin-top: 2.5rem; } .blog-grid { grid-template-columns: 1fr; } }
  ${T.customCss || ''}
</style>
</head>
<body>
<nav>
  <a href="/" style="font-weight:700;font-size:1.05rem;font-family:${T.fontHeading};color:${T.primary};${T.headingTracking}">${escapeHtml(company.name)}</a>
  <div style="display:flex;gap:1.25rem;align-items:center">
    <a href="/blog" style="font-weight:600;color:${T.primary}">Blog</a>
    <a href="/#contact" style="background:${T.primary};color:${isDark ? '#000' : '#fff'};padding:0.45rem 1.1rem;border-radius:${T.btnRadius};font-weight:600;font-size:0.85rem">Contact</a>
  </div>
</nav>

<div class="blog-header">
  <h1>Insights &amp; Articles</h1>
  <p>Expert perspectives from ${escapeHtml(company.name)}</p>
</div>

<div class="blog-grid">
  ${cardsHtml}
</div>

<footer>© ${new Date().getFullYear()} ${escapeHtml(company.name)} · All rights reserved</footer>

<script>
fetch('/ping', { method: 'POST', headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ path: window.location.pathname, referrer: document.referrer })
}).catch(()=>{});
</script>
</body>
</html>`
}

module.exports = { renderPage, renderBlogPost, renderBlogListing, THEMES }
