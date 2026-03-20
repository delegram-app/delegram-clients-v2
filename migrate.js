/**
 * Database migration runner
 * Run: node migrate.js [platform|clients|both]
 */

const { platform, clients } = require('./db')
const fs = require('fs')
const path = require('path')

async function migrate(pool, schemaFile, label) {
  console.log(`\nRunning ${label} migrations from ${schemaFile}...`)
  try {
    const sql = fs.readFileSync(path.join(__dirname, schemaFile), 'utf8')
    await pool.query(sql)
    console.log(`✓ ${label} migrations complete`)
  } catch (err) {
    console.error(`✗ ${label} migration error:`, err.message)
    throw err
  }
}

async function main() {
  const target = process.argv[2] || 'both'
  
  try {
    if (target === 'platform' || target === 'both') {
      await migrate(platform, 'schema-platform.sql', 'Platform DB')
    }
    if (target === 'clients' || target === 'both') {
      await migrate(clients, 'schema-clients-base.sql', 'Clients DB')
    }
    console.log('\n✓ All migrations complete')
  } catch (err) {
    process.exit(1)
  } finally {
    await platform.end()
    await clients.end()
  }
}

main()
