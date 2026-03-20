#!/usr/bin/env node
/**
 * Seed briezies into delegram-clients-v2 schema
 * Creates: company, domain, site, homepage (updated landing page)
 */

const { Pool } = require('pg')
const CLIENTS_DB = 'postgresql://neondb_owner:npg_Ey8zMJD7NOGS@ep-shiny-heart-anz6z9xm-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'

const db = new Pool({ connectionString: CLIENTS_DB })

const HOMEPAGE_CONTENT = {
  type: 'page',
  children: [
    {
      type: 'nav',
      props: { brand: 'Briezies' },
      children: [
        { type: 'nav_link', props: { href: '#about', label: 'Our Story' } },
        { type: 'nav_link', props: { href: '#features', label: 'Why Briezies' } },
        { type: 'nav_cta', props: { href: '#waitlist', label: 'Join Waitlist' } }
      ]
    },
    {
      type: 'hero',
      props: {
        eyebrow: 'Finally — Comfort Meets Confidence',
        headline: 'Bras designed around your body. Not the other way around.',
        subtitle: 'Briezies uses adaptive fit technology and inclusive sizing to give every body the support it deserves. No more compromises.'
      },
      children: [
        {
          type: 'flex',
          props: { justify: 'center', gap: '1rem', style: 'margin-bottom: 2.5rem; flex-wrap: wrap;' },
          children: [
            { type: 'button', props: { href: '#waitlist', label: 'Get Early Access', padding: '0.9rem 2.2rem' } },
            { type: 'button', props: { href: '#features', label: 'Learn More', variant: 'outline', padding: '0.9rem 2.2rem' } }
          ]
        },
        {
          type: 'subscribe_form',
          props: {
            id: 'waitlist',
            placeholder: 'Enter your email',
            button_label: 'Join Waitlist',
            margin: '0 auto'
          }
        }
      ]
    },
    {
      type: 'section',
      props: { id: 'features', margin: '6rem auto', max_width: '1100px' },
      children: [
        {
          type: 'h2',
          props: { text: 'Why thousands are switching to Briezies', style: 'text-align:center;margin-bottom:0.75rem' }
        },
        {
          type: 'p',
          props: { text: 'Built by women, tested by real bodies across every size.', style: 'text-align:center;opacity:0.6;margin-bottom:3rem' }
        },
        {
          type: 'grid',
          props: { columns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' },
          children: [
            {
              type: 'card',
              children: [
                { type: 'feature', props: { icon: '🧬', title: 'Adaptive Fit Technology', description: 'Precision-engineered straps and band construction that move with your body through every activity.' } }
              ]
            },
            {
              type: 'card',
              children: [
                { type: 'feature', props: { icon: '📏', title: 'Inclusive Sizing', description: 'Sizes from 28AA to 50K. Because support should never be a luxury for larger sizes.' } }
              ]
            },
            {
              type: 'card',
              children: [
                { type: 'feature', props: { icon: '🌿', title: 'Sustainable Materials', description: 'OEKO-TEX certified fabrics. Soft, breathable, and made to last — not to end up in landfill.' } }
              ]
            },
            {
              type: 'card',
              children: [
                { type: 'feature', props: { icon: '🔄', title: 'Free Returns, Always', description: 'Not the right fit? Return it free, no questions asked. Getting the fit right matters more than anything.' } }
              ]
            }
          ]
        }
      ]
    },
    {
      type: 'section',
      props: { margin: '6rem auto', max_width: '900px' },
      children: [
        {
          type: 'h2',
          props: { text: 'What our community says', style: 'text-align:center;margin-bottom:3rem' }
        },
        {
          type: 'grid',
          props: { columns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
          children: [
            {
              type: 'testimonial',
              props: {
                quote: "I've been wearing the wrong size for 10 years. Briezies' fit quiz changed everything — it's like it was made for me.",
                name: 'Sarah M.',
                title: 'Size 36G · London'
              }
            },
            {
              type: 'testimonial',
              props: {
                quote: 'Finally a brand that doesn\'t stop at 38DD. I cried when my order arrived and it actually fit perfectly.',
                name: 'Priya K.',
                title: 'Size 42J · Manchester'
              }
            },
            {
              type: 'testimonial',
              props: {
                quote: 'Wore it for a 10k run and forgot I had it on. That is literally the highest praise I can give a sports bra.',
                name: 'Jordan T.',
                title: 'Size 32D · Bristol'
              }
            }
          ]
        }
      ]
    },
    {
      type: 'section',
      props: { margin: '6rem auto', max_width: '700px', style: 'text-align:center' },
      children: [
        {
          type: 'h2',
          props: { text: 'Be first in line', style: 'margin-bottom:1rem' }
        },
        {
          type: 'p',
          props: { text: 'We\'re launching soon. Join the waitlist for early access, exclusive launch pricing, and a free fit consultation.', style: 'opacity:0.7;margin-bottom:2rem' }
        },
        {
          type: 'subscribe_form',
          props: {
            placeholder: 'Your email address',
            button_label: 'Count Me In',
            margin: '0 auto'
          }
        }
      ]
    },
    {
      type: 'footer',
      props: { copyright: '© 2025 Briezies · All rights reserved' },
      children: [
        {
          type: 'flex',
          props: { justify: 'space-between', align: 'center', wrap: 'wrap', gap: '1rem' },
          children: [
            { type: 'text', props: { text: 'Briezies', style: 'font-weight:700;font-size:1.2rem;color:var(--primary)' } },
            {
              type: 'flex',
              props: { gap: '1.5rem' },
              children: [
                { type: 'link', props: { href: 'mailto:hello@briezies.com', label: 'Contact' } },
                { type: 'link', props: { href: '#', label: 'Privacy Policy' } },
                { type: 'link', props: { href: 'https://delegram.app', label: 'Powered by Delegram' } }
              ]
            }
          ]
        }
      ]
    }
  ]
}

const SITE_THEME = {
  primary_color: '#22c55e',
  bg_color: '#050f07',
  text_color: '#f0fdf4',
  font_family: 'Inter, -apple-system, sans-serif'
}

const SITE_SEO = {
  title: 'Briezies — Bras That Work With Your Body',
  description: 'Inclusive, adaptive-fit lingerie for every body. Sizes 28AA–50K. Launching soon — join the waitlist.',
  og_image: ''
}

async function seed() {
  const client = await db.connect()
  try {
    await client.query('BEGIN')

    // 1. Company
    const companyRes = await client.query(`
      INSERT INTO companies (name, slug, plan, status, settings)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
      RETURNING id
    `, ['Briezies', 'briezies', 'starter', 'active', JSON.stringify({ industry: 'fashion', region: 'UK' })])
    const companyId = companyRes.rows[0].id
    console.log('✓ Company:', companyId)

    // 2. Domain
    const domainRes = await client.query(`
      INSERT INTO domains (company_id, hostname, is_primary, provider, ssl_status, verification_status)
      VALUES ($1, $2, true, 'cloudflare', 'active', 'verified')
      ON CONFLICT (hostname) DO UPDATE SET company_id = EXCLUDED.company_id, updated_at = now()
      RETURNING id
    `, [companyId, 'briezies.delegram.app'])
    const domainId = domainRes.rows[0].id
    console.log('✓ Domain:', domainId)

    // 3. Site
    const siteRes = await client.query(`
      INSERT INTO sites (company_id, domain_id, name, slug, status, theme, seo, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, now())
      ON CONFLICT (company_id, slug) DO UPDATE SET
        domain_id = EXCLUDED.domain_id,
        theme = EXCLUDED.theme,
        seo = EXCLUDED.seo,
        status = EXCLUDED.status,
        updated_at = now()
      RETURNING id
    `, [companyId, domainId, 'Briezies Main Site', 'main', 'published',
        JSON.stringify(SITE_THEME), JSON.stringify(SITE_SEO)])
    const siteId = siteRes.rows[0].id
    console.log('✓ Site:', siteId)

    // 4. Homepage
    await client.query(`
      INSERT INTO pages (site_id, slug, path, title, page_type, status, content_json, seo, is_homepage, sort_order, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 0, now())
      ON CONFLICT (site_id, path) DO UPDATE SET
        content_json = EXCLUDED.content_json,
        seo = EXCLUDED.seo,
        status = EXCLUDED.status,
        title = EXCLUDED.title,
        is_homepage = true,
        updated_at = now()
    `, [siteId, 'home', '/', 'Home', 'standard', 'published',
        JSON.stringify(HOMEPAGE_CONTENT), JSON.stringify({ title: 'Briezies — Bras That Work With Your Body', description: SITE_SEO.description })])
    console.log('✓ Homepage seeded')

    await client.query('COMMIT')
    console.log('\n✅ Briezies seeded successfully')
    console.log('   Company ID:', companyId)
    console.log('   Site ID:', siteId)
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('❌ Seed failed:', e.message)
    process.exit(1)
  } finally {
    client.release()
    await db.end()
  }
}

seed()
