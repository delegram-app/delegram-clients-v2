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
    // Split safely - don't split inside dollar-quoted strings
    const statements = splitSql(sql)
    let count = 0
    for (const stmt of statements) {
      if (stmt.trim().length < 3) continue
      try {
        await pool.query(stmt)
        count++
      } catch (err) {
        // Ignore "already exists" errors (idempotent)
        if (err.message.includes('already exists') || 
            err.message.includes('duplicate key') ||
            err.code === '42P07' || err.code === '42710') {
          count++
          continue
        }
        console.error(`✗ ${label} migration error at stmt ${count+1}: ${err.message.split('\n')[0]}`)
        console.error('Statement:', stmt.substring(0, 100))
        throw err
      }
    }
    console.log(`✓ ${label} migrations complete (${count} statements)`)
  } catch (err) {
    if (!err.message.includes('already exists')) throw err
  }
}

function splitSql(sql) {
  const statements = []
  let current = ''
  let inDollarQuote = false
  let dollarTag = ''
  
  let i = 0
  while (i < sql.length) {
    // Check for dollar-quote start/end
    if (!inDollarQuote && sql[i] === '$') {
      const end = sql.indexOf('$', i + 1)
      if (end !== -1) {
        const tag = sql.substring(i, end + 1)
        if (/^\$[a-zA-Z0-9_]*\$$/.test(tag)) {
          inDollarQuote = true
          dollarTag = tag
          current += tag
          i = end + 1
          continue
        }
      }
    }
    if (inDollarQuote && sql.startsWith(dollarTag, i)) {
      inDollarQuote = false
      current += dollarTag
      i += dollarTag.length
      dollarTag = ''
      continue
    }
    if (!inDollarQuote && sql[i] === ';') {
      statements.push(current.trim())
      current = ''
      i++
      continue
    }
    current += sql[i]
    i++
  }
  if (current.trim()) statements.push(current.trim())
  return statements
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
