const { Pool } = require('pg')

// Platform DB - companies, users, billing, auth
const platform = new Pool({
  connectionString: process.env.PLATFORM_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
})

// Clients DB - sites, pages, contacts, tasks, agents, everything tenant
const clients = new Pool({
  connectionString: process.env.CLIENTS_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
})

module.exports = { platform, clients }
