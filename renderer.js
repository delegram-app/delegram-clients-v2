/**
 * Page renderer - assembles HTML from content_json
 * content_json is a component tree: { type, props, children }
 */

// ─── 6 Industry Themes ──────────────────────────────────────────────────────

const THEMES = {

  // 1. Prestige — Luxury, chauffeur, private aviation, high-end hospitality
  prestige: {
    bg: '#09090B',
    text: '#F5F0E8',
    primary: '#C9A84C',
    muted: 'rgba(201,168,76,0.15)',
    border: 'rgba(201,168,76,0.2)',
    borderSubtle: 'rgba(255,255,255,0.08)',
    cardBg: 'rgba(255,255,255,0.03)',
    navBorder: 'rgba(201,168,76,0.15)',
    radius: '2px',
    radiusLg: '4px',
    btnRadius: '2px',
    fontHeading: "'Playfair Display', Georgia, serif",
    fontBody: "'Inter', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap",
    headingWeight: '700',
    headingTracking: 'letter-spacing:-0.01em',
    eyebrowStyle: 'letter-spacing:0.2em;font-size:0.75rem;text-transform:uppercase;',
    statValueColor: '#C9A84C',
    shadow: '0 1px 3px rgba(0,0,0,0.5)',
    heroAlign: 'center',
    sectionPadding: '6rem 2rem',
    customCss: `
      h1,h2,h3 { font-family: 'Playfair Display', Georgia, serif; }
      nav a { font-weight: 300; letter-spacing: 0.05em; font-size: 0.9rem; }
      .divider-line { border-color: rgba(201,168,76,0.2) !important; }
    `,
  },

  // 2. Corporate — B2B SaaS, fintech, professional services, tech
  corporate: {
    bg: '#0F172A',
    text: '#E2E8F0',
    primary: '#6366F1',
    muted: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.3)',
    borderSubtle: 'rgba(255,255,255,0.08)',
    cardBg: 'rgba(255,255,255,0.04)',
    navBorder: 'rgba(255,255,255,0.07)',
    radius: '8px',
    radiusLg: '12px',
    btnRadius: '6px',
    fontHeading: "'Inter', -apple-system, sans-serif",
    fontBody: "'Inter', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    headingWeight: '800',
    headingTracking: 'letter-spacing:-0.04em',
    eyebrowStyle: 'letter-spacing:0.08em;font-size:0.8rem;text-transform:uppercase;',
    statValueColor: '#6366F1',
    shadow: '0 4px 24px rgba(99,102,241,0.15)',
    heroAlign: 'center',
    sectionPadding: '5rem 2rem',
    customCss: `
      .stat-value { font-variant-numeric: tabular-nums; }
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
  if (key && THEMES[key]) return { ...THEMES[key], _key: key }

  // Legacy: if theme has explicit colors but no key, wrap them into signal-style
  if (siteTheme?.primary_color) {
    return {
      ...THEMES.signal,
      bg: siteTheme.bg_color || THEMES.signal.bg,
      text: siteTheme.text_color || THEMES.signal.text,
      primary: siteTheme.primary_color,
      _key: 'custom',
    }
  }

  return { ...THEMES.corporate, _key: 'corporate' }
}

// ─── Page renderer ───────────────────────────────────────────────────────────

function renderPage({ company, site, page }) {
  const T = resolveTheme(site.theme || {})
  const seo = { ...(site.seo || {}), ...(page.seo || {}) }

  const bodyHtml = renderComponents(page.content_json, T)

  const isDark = T.bg.startsWith('#0') || T.bg.startsWith('#1') || T.bg.startsWith('#09')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(seo.title || page.title)} | ${escapeHtml(company.name)}</title>
${seo.description ? `<meta name="description" content="${escapeAttr(seo.description)}">` : ''}
${seo.og_image ? `<meta property="og:image" content="${escapeAttr(seo.og_image)}">` : ''}
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
  ${T.customCss || ''}
</style>
</head>
<body>
${bodyHtml}
<script>
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
        form.innerHTML = '<p style="color:var(--primary);padding:1rem">✓ You\\'re on the list!</p>';
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
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const inputBorder = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'
  const btnTextColor = isDark ? '#000' : '#fff'

  switch (type) {
    // ── Layout ──────────────────────────────────────────────────────────────
    case 'nav': return `<nav style="display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2.5rem;border-bottom:1px solid ${T.navBorder};position:sticky;top:0;z-index:100;background:${T.bg};${props.style||''}">
  <div style="font-weight:${T.headingWeight};font-size:1.25rem;font-family:${T.fontHeading};color:${pc};${T.headingTracking}">${escapeHtml(props.brand||'')}</div>
  <div style="display:flex;gap:1.25rem;align-items:center">${childHtml}</div>
</nav>`

    case 'section': return `<section style="max-width:${props.max_width||'1100px'};margin:${props.margin||'0 auto'};padding:${props.padding||T.sectionPadding};${props.style||''}">${childHtml}</section>`

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
      return `<div style="text-align:${align};max-width:820px;${align==='center'?'margin:5rem auto':'margin:5rem 0'};padding:0 2rem;${props.style||''}">
  ${props.eyebrow ? `<p style="${T.eyebrowStyle}color:${pc};margin-bottom:1.25rem">${escapeHtml(props.eyebrow)}</p>` : ''}
  ${props.headline ? `<h1 style="font-size:clamp(2.2rem,5.5vw,4rem);font-weight:${T.headingWeight};line-height:1.1;${T.headingTracking};font-family:${T.fontHeading};margin-bottom:1.5rem">${escapeHtml(props.headline)}</h1>` : ''}
  ${subtitleHtml}
  ${childHtml}
</div>`
    }

    case 'grid': return `<div style="display:grid;grid-template-columns:${props.columns||'repeat(auto-fit,minmax(280px,1fr))'};gap:${props.gap||'2rem'};${props.style||''}">${childHtml}</div>`

    case 'flex': return `<div style="display:flex;gap:${props.gap||'1rem'};align-items:${props.align||'center'};justify-content:${props.justify||'flex-start'};flex-wrap:${props.wrap||'wrap'};${props.style||''}">${childHtml}</div>`

    case 'card': return `<div style="background:${T.cardBg};border:1px solid ${T.borderSubtle};border-radius:${T.radiusLg};padding:${props.padding||'2rem'};box-shadow:${T.shadow};${props.style||''}">${childHtml}</div>`

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
    case 'subscribe_form': return `<form data-subscribe-form style="display:flex;gap:0.75rem;max-width:${props.max_width||'440px'};margin:${props.margin||'0 auto'};flex-wrap:wrap;${props.style||''}">
  <input data-email type="email" placeholder="${escapeAttr(props.placeholder||'Enter your email')}" required
    style="flex:1;min-width:200px;background:${inputBg};border:1px solid ${inputBorder};border-radius:${T.radius};padding:0.85rem 1.1rem;color:inherit;font-size:0.95rem;font-family:inherit">
  ${props.name_field ? `<input data-name type="text" placeholder="${escapeAttr(props.name_placeholder||'Your name')}" style="flex:1;min-width:160px;background:${inputBg};border:1px solid ${inputBorder};border-radius:${T.radius};padding:0.85rem 1.1rem;color:inherit;font-family:inherit">` : ''}
  <button type="submit" style="background:${pc};color:${btnTextColor};border:none;border-radius:${T.btnRadius};padding:0.85rem 1.6rem;font-weight:700;cursor:pointer;white-space:nowrap;font-family:inherit;font-size:0.95rem">
    ${escapeHtml(props.button_label||'Get Started')}
  </button>
</form>`

    case 'contact_form': return `<form action="/contact" method="POST" style="display:flex;flex-direction:column;gap:1rem;max-width:${props.max_width||'500px'};${props.style||''}">
  <input name="name" type="text" placeholder="Your name" style="background:${inputBg};border:1px solid ${inputBorder};border-radius:${T.radius};padding:0.85rem 1.1rem;color:inherit;font-family:inherit">
  <input name="email" type="email" placeholder="Email address" required style="background:${inputBg};border:1px solid ${inputBorder};border-radius:${T.radius};padding:0.85rem 1.1rem;color:inherit;font-family:inherit">
  <textarea name="message" rows="4" placeholder="Message" style="background:${inputBg};border:1px solid ${inputBorder};border-radius:${T.radius};padding:0.85rem 1.1rem;color:inherit;resize:vertical;font-family:inherit"></textarea>
  <button type="submit" style="background:${pc};color:${btnTextColor};border:none;border-radius:${T.btnRadius};padding:0.9rem;font-weight:700;cursor:pointer;font-family:inherit">Send Message</button>
</form>`

    // ── Features / Pricing ───────────────────────────────────────────────────
    case 'feature': return `<div style="padding:${props.padding||'0'};${props.style||''}">
  ${props.icon ? `<div style="font-size:2rem;margin-bottom:1.1rem">${escapeHtml(props.icon)}</div>` : ''}
  ${props.title ? `<h3 style="font-size:1.05rem;font-weight:600;font-family:${T.fontHeading};margin-bottom:0.6rem">${escapeHtml(props.title)}</h3>` : ''}
  ${props.description ? `<p style="opacity:0.7;line-height:1.7;font-size:0.95rem">${escapeHtml(props.description)}</p>` : ''}
  ${childHtml}
</div>`

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

module.exports = { renderPage, THEMES }
