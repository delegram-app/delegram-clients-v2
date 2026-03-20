/**
 * Page renderer - assembles HTML from content_json
 * content_json is a component tree: { type, props, children }
 */

function renderPage({ company, site, page }) {
  const theme = site.theme || {}
  const seo = { ...site.seo, ...page.seo }
  const primaryColor = theme.primary_color || '#22c55e'
  const bgColor = theme.bg_color || '#050f07'
  const textColor = theme.text_color || '#f0fdf4'
  const fontFamily = theme.font_family || 'Inter, -apple-system, sans-serif'

  const bodyHtml = renderComponents(page.content_json, theme)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${seo.title || page.title} | ${company.name}</title>
${seo.description ? `<meta name="description" content="${escapeAttr(seo.description)}">` : ''}
${seo.og_image ? `<meta property="og:image" content="${escapeAttr(seo.og_image)}">` : ''}
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --primary: ${primaryColor};
    --bg: ${bgColor};
    --text: ${textColor};
    --font: ${fontFamily};
  }
  body { font-family: var(--font); background: var(--bg); color: var(--text); }
  a { color: var(--primary); }
  img { max-width: 100%; }
  ${theme.custom_css || ''}
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

function renderComponents(node, theme) {
  if (!node) return ''
  if (typeof node === 'string') return escapeHtml(node)
  if (Array.isArray(node)) return node.map(n => renderComponents(n, theme)).join('\n')

  const { type, props = {}, children = [] } = node
  if (!type) return ''

  const childHtml = renderComponents(children, theme)
  const pc = theme.primary_color || '#22c55e'

  switch (type) {
    // ── Layout ──────────────────────────────────────────────────────────────
    case 'nav': return `<nav style="display:flex;justify-content:space-between;align-items:center;padding:1.5rem 2.5rem;border-bottom:1px solid rgba(255,255,255,0.1);${props.style||''}">
  <div style="font-weight:700;font-size:1.3rem;color:${pc}">${escapeHtml(props.brand||'')}</div>
  <div style="display:flex;gap:1rem;align-items:center">${childHtml}</div>
</nav>`

    case 'section': return `<section style="max-width:${props.max_width||'1100px'};margin:${props.margin||'4rem auto'};padding:${props.padding||'0 2rem'};${props.style||''}">${childHtml}</section>`

    case 'hero': return `<div style="text-align:center;max-width:800px;margin:5rem auto;padding:0 2rem;${props.style||''}">
  ${props.eyebrow ? `<p style="text-transform:uppercase;letter-spacing:0.1em;font-size:0.85rem;color:${pc};margin-bottom:1rem">${escapeHtml(props.eyebrow)}</p>` : ''}
  ${props.headline ? `<h1 style="font-size:clamp(2rem,5vw,3.5rem);font-weight:800;line-height:1.1;margin-bottom:1.5rem">${escapeHtml(props.headline)}</h1>` : ''}
  ${props.subtitle ? `<p style="font-size:1.15rem;line-height:1.7;opacity:0.8;max-width:600px;margin:0 auto 2.5rem">${escapeHtml(props.subtitle)}</p>` : ''}
  ${childHtml}
</div>`

    case 'grid': return `<div style="display:grid;grid-template-columns:${props.columns||'repeat(auto-fit,minmax(280px,1fr))'};gap:${props.gap||'2rem'};${props.style||''}">${childHtml}</div>`

    case 'flex': return `<div style="display:flex;gap:${props.gap||'1rem'};align-items:${props.align||'center'};justify-content:${props.justify||'flex-start'};flex-wrap:${props.wrap||'wrap'};${props.style||''}">${childHtml}</div>`

    case 'card': return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:${props.padding||'2rem'};${props.style||''}">${childHtml}</div>`

    case 'divider': return `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:${props.margin||'3rem 0'}">`

    case 'spacer': return `<div style="height:${props.height||'2rem'}"></div>`

    // ── Typography ───────────────────────────────────────────────────────────
    case 'h1': return `<h1 style="font-size:${props.size||'2.5rem'};font-weight:${props.weight||'800'};line-height:1.1;${props.style||''}">${childHtml||escapeHtml(props.text||'')}</h1>`
    case 'h2': return `<h2 style="font-size:${props.size||'2rem'};font-weight:${props.weight||'700'};${props.style||''}">${childHtml||escapeHtml(props.text||'')}</h2>`
    case 'h3': return `<h3 style="font-size:${props.size||'1.5rem'};font-weight:${props.weight||'600'};${props.style||''}">${childHtml||escapeHtml(props.text||'')}</h3>`
    case 'p': return `<p style="line-height:1.7;${props.style||''}">${childHtml||escapeHtml(props.text||'')}</p>`
    case 'text': return `<span style="${props.style||''}">${escapeHtml(props.text||'')}</span>`
    case 'label': return `<p style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;${props.style||''}">${escapeHtml(props.text||'')}</p>`

    // ── Media ────────────────────────────────────────────────────────────────
    case 'image': return `<img src="${escapeAttr(props.src||'')}" alt="${escapeAttr(props.alt||'')}" style="border-radius:${props.radius||'8px'};${props.style||''}">`

    case 'video': return `<video src="${escapeAttr(props.src||'')}" ${props.autoplay?'autoplay muted loop':''} ${props.controls?'controls':''} style="width:100%;border-radius:${props.radius||'8px'};${props.style||''}"></video>`

    case 'icon': return `<span style="font-size:${props.size||'2rem'}">${escapeHtml(props.emoji||'')}</span>`

    // ── Buttons & Links ──────────────────────────────────────────────────────
    case 'button': return `<a href="${escapeAttr(props.href||'#')}" style="display:inline-block;background:${props.variant==='outline'?'transparent':pc};color:${props.variant==='outline'?pc:'#000'};border:${props.variant==='outline'?`2px solid ${pc}`:'none'};padding:${props.padding||'0.8rem 2rem'};border-radius:${props.radius||'8px'};font-weight:600;text-decoration:none;font-size:${props.size||'1rem'};cursor:pointer;${props.style||''}">${escapeHtml(props.label||'')}</a>`

    case 'link': return `<a href="${escapeAttr(props.href||'#')}" style="${props.style||''}">${childHtml||escapeHtml(props.label||props.text||'')}</a>`

    // ── Forms ────────────────────────────────────────────────────────────────
    case 'subscribe_form': return `<form data-subscribe-form style="display:flex;gap:0.75rem;max-width:${props.max_width||'420px'};margin:${props.margin||'0 auto'};${props.style||''}">
  <input data-email type="email" placeholder="${escapeAttr(props.placeholder||'Enter your email')}" required
    style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:0.8rem 1rem;color:inherit;font-size:0.95rem">
  ${props.name_field ? `<input data-name type="text" placeholder="${escapeAttr(props.name_placeholder||'Your name')}" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:0.8rem 1rem;color:inherit">` : ''}
  <button type="submit" style="background:${pc};color:#000;border:none;border-radius:8px;padding:0.8rem 1.4rem;font-weight:700;cursor:pointer;white-space:nowrap">
    ${escapeHtml(props.button_label||'Join')}
  </button>
</form>`

    case 'contact_form': return `<form action="/contact" method="POST" style="display:flex;flex-direction:column;gap:1rem;max-width:${props.max_width||'500px'};${props.style||''}">
  <input name="name" type="text" placeholder="Your name" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:0.8rem 1rem;color:inherit">
  <input name="email" type="email" placeholder="Email address" required style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:0.8rem 1rem;color:inherit">
  <textarea name="message" rows="4" placeholder="Message" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:0.8rem 1rem;color:inherit;resize:vertical"></textarea>
  <button type="submit" style="background:${pc};color:#000;border:none;border-radius:8px;padding:0.9rem;font-weight:700;cursor:pointer">Send Message</button>
</form>`

    // ── Features / Pricing ───────────────────────────────────────────────────
    case 'feature': return `<div style="${props.style||''}">
  ${props.icon ? `<div style="font-size:2rem;margin-bottom:1rem">${escapeHtml(props.icon)}</div>` : ''}
  ${props.title ? `<h3 style="font-size:1.1rem;font-weight:600;margin-bottom:0.5rem">${escapeHtml(props.title)}</h3>` : ''}
  ${props.description ? `<p style="opacity:0.7;line-height:1.6">${escapeHtml(props.description)}</p>` : ''}
  ${childHtml}
</div>`

    case 'pricing_card': return `<div style="background:${props.featured?`rgba(255,255,255,0.05)`:'rgba(255,255,255,0.02)'};border:${props.featured?`2px solid ${pc}`:'1px solid rgba(255,255,255,0.1)'};border-radius:16px;padding:2rem;${props.style||''}">
  ${props.plan ? `<p style="text-transform:uppercase;letter-spacing:0.1em;font-size:0.8rem;color:${pc}">${escapeHtml(props.plan)}</p>` : ''}
  ${props.price ? `<div style="font-size:3rem;font-weight:800;margin:1rem 0">${escapeHtml(props.price)}<span style="font-size:1rem;font-weight:400;opacity:0.6">${escapeHtml(props.period||'/mo')}</span></div>` : ''}
  ${props.description ? `<p style="opacity:0.7;margin-bottom:1.5rem">${escapeHtml(props.description)}</p>` : ''}
  ${childHtml}
</div>`

    case 'bullet_list': {
      const items = props.items || []
      return `<ul style="list-style:none;${props.style||''}">
  ${items.map(item => `<li style="display:flex;align-items:flex-start;gap:0.75rem;margin-bottom:0.75rem">
    <span style="color:${pc};flex-shrink:0">✓</span>
    <span>${escapeHtml(typeof item === 'string' ? item : item.text || '')}</span>
  </li>`).join('')}
</ul>`
    }

    // ── Social proof ─────────────────────────────────────────────────────────
    case 'testimonial': return `<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:2rem;${props.style||''}">
  ${props.quote ? `<p style="font-size:1.1rem;line-height:1.7;font-style:italic;margin-bottom:1.5rem">"${escapeHtml(props.quote)}"</p>` : ''}
  <div style="display:flex;align-items:center;gap:0.75rem">
    ${props.avatar ? `<img src="${escapeAttr(props.avatar)}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">` : `<div style="width:40px;height:40px;border-radius:50%;background:${pc};display:flex;align-items:center;justify-content:center;font-weight:700;color:#000">${escapeHtml((props.name||'?')[0])}</div>`}
    <div>
      <p style="font-weight:600">${escapeHtml(props.name||'')}</p>
      ${props.title ? `<p style="font-size:0.85rem;opacity:0.6">${escapeHtml(props.title)}</p>` : ''}
    </div>
  </div>
</div>`

    case 'stat': return `<div style="text-align:center;${props.style||''}">
  <div style="font-size:${props.value_size||'3rem'};font-weight:800;color:${pc}">${escapeHtml(props.value||'')}</div>
  <div style="opacity:0.7;margin-top:0.25rem">${escapeHtml(props.label||'')}</div>
</div>`

    // ── Navigation ───────────────────────────────────────────────────────────
    case 'nav_link': return `<a href="${escapeAttr(props.href||'#')}" style="color:inherit;text-decoration:none;opacity:0.8;${props.style||''}">${escapeHtml(props.label||'')}</a>`

    case 'nav_cta': return `<a href="${escapeAttr(props.href||'#')}" style="background:${pc};color:#000;padding:0.5rem 1.2rem;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.9rem;${props.style||''}">${escapeHtml(props.label||'')}</a>`

    // ── Footer ───────────────────────────────────────────────────────────────
    case 'footer': return `<footer style="border-top:1px solid rgba(255,255,255,0.1);padding:3rem 2.5rem;margin-top:5rem;${props.style||''}">
  <div style="max-width:1100px;margin:0 auto">
    ${childHtml}
    ${props.copyright ? `<p style="opacity:0.4;font-size:0.85rem;margin-top:2rem">${escapeHtml(props.copyright)}</p>` : ''}
  </div>
</footer>`

    // ── Raw HTML (agents can use this for complex custom blocks) ─────────────
    case 'html': return props.content || ''

    // ── Unknown: render children ─────────────────────────────────────────────
    default:
      if (childHtml) return `<div${props.style?` style="${escapeAttr(props.style)}"`:''} class="${escapeAttr(type)}">${childHtml}</div>`
      return `<div class="${escapeAttr(type)}"></div>`
  }
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(str) {
  if (!str) return ''
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

module.exports = { renderPage }
