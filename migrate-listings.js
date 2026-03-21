require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.CLIENTS_DATABASE_URL })

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('Running listings migration...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        category TEXT,
        location TEXT,
        description TEXT,
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        images JSONB NOT NULL DEFAULT '[]'::jsonb,
        contact JSONB NOT NULL DEFAULT '{}'::jsonb,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        featured BOOLEAN NOT NULL DEFAULT false,
        status TEXT NOT NULL DEFAULT 'active',
        stripe_price_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_listings_company_id ON listings(company_id);
      CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
      CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
    `)
    console.log('✓ listings table created')
    await client.query(`
      CREATE OR REPLACE FUNCTION set_listings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = now(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;
      DROP TRIGGER IF EXISTS trg_listings_updated_at ON listings;
      CREATE TRIGGER trg_listings_updated_at BEFORE UPDATE ON listings
      FOR EACH ROW EXECUTE FUNCTION set_listings_updated_at();
    `)
    console.log('✓ listings trigger created')
    console.log('Migration complete.')
  } catch (err) {
    console.error('Migration error:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
