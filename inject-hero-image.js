const { Pool } = require('pg')
const db = new Pool({ connectionString: 'postgresql://neondb_owner:npg_Ey8zMJD7NOGS@ep-shiny-heart-anz6z9xm-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require' })

const IMAGE_URL = 'https://delegram-clients-v2.onrender.com/assets/neonetic-hero.jpg'

async function run() {
  const r = await db.query(`
    SELECT p.id, p.content_json FROM pages p
    JOIN sites s ON p.site_id = s.id
    JOIN companies c ON s.company_id = c.id
    WHERE c.slug = 'neonetic' AND p.is_homepage = true
  `)
  if (!r.rows.length) { console.log('No neonetic page'); process.exit(1) }

  const page = r.rows[0]
  const cj = page.content_json
  const heroIdx = cj.children.findIndex(c => c.type === 'hero')
  if (heroIdx === -1) { console.log('No hero section'); process.exit(1) }

  const hero = cj.children[heroIdx]
  const eyebrow = hero.props?.eyebrow || ''
  const headline = hero.props?.headline || ''
  const subtitle = hero.props?.subtitle || ''

  // Replace hero with image-backed HTML version
  cj.children[heroIdx] = {
    type: 'html',
    props: {
      content: `
<div style="position:relative;overflow:hidden;text-align:center">
  <div style="position:absolute;inset:0;z-index:0">
    <img src="${IMAGE_URL}" alt="Neonetic Training" style="width:100%;height:100%;object-fit:cover;object-position:center 25%;filter:brightness(0.28) contrast(1.1) saturate(0.85)">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,10,15,0.2) 0%,rgba(10,10,15,0.95) 90%)"></div>
  </div>
  <div style="position:relative;z-index:1;max-width:800px;margin:0 auto;padding:7rem 2rem 5rem">
    ${eyebrow ? `<p style="text-transform:uppercase;letter-spacing:0.15em;font-size:0.8rem;color:#f97316;margin-bottom:1.2rem;font-weight:600">${eyebrow}</p>` : ''}
    <h1 style="font-size:clamp(2.2rem,5vw,3.8rem);font-weight:900;line-height:1.05;margin-bottom:1.5rem;color:#fff;text-shadow:0 2px 30px rgba(0,0,0,0.6)">${headline}</h1>
    <p id="hero-sub-tw" style="font-size:1.15rem;line-height:1.7;max-width:600px;margin:0 auto 2.5rem;color:rgba(255,255,255,0.85);min-height:2.5em"></p>
    <script>(function(){var el=document.getElementById('hero-sub-tw');var txt=${JSON.stringify(subtitle)};var i=0;function type(){if(i<txt.length){el.textContent+=txt[i++];setTimeout(type,28);}}setTimeout(type,500);})()</script>
    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:2.5rem">
      <a href="#trial" style="display:inline-block;background:#f97316;color:#fff;padding:1rem 2.5rem;border-radius:10px;font-weight:800;text-decoration:none;font-size:1.05rem;box-shadow:0 4px 24px rgba(249,115,22,0.45);transition:transform 0.15s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">Book Free Trial</a>
      <a href="#how" style="display:inline-block;background:rgba(255,255,255,0.08);backdrop-filter:blur(8px);color:#fff;border:1.5px solid rgba(255,255,255,0.3);padding:1rem 2.5rem;border-radius:10px;font-weight:700;text-decoration:none;font-size:1.05rem">See How It Works</a>
    </div>
    <form data-subscribe-form style="display:flex;gap:0.75rem;max-width:420px;margin:0 auto">
      <input data-email type="email" placeholder="Enter your email" required style="flex:1;background:rgba(255,255,255,0.08);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:0.85rem 1rem;color:#fff;font-size:0.95rem">
      <button type="submit" style="background:#f97316;color:#fff;border:none;border-radius:8px;padding:0.85rem 1.4rem;font-weight:700;cursor:pointer;white-space:nowrap">Get Started</button>
    </form>
  </div>
</div>`
    }
  }

  await db.query('UPDATE pages SET content_json = $1, updated_at = now() WHERE id = $2', [JSON.stringify(cj), page.id])
  console.log('✓ Hero image injected — live immediately')
  await db.end()
}

run().catch(e => { console.error(e.message); process.exit(1) })
