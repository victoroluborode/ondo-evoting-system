const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Keeps enough PostgreSQL connections available for concurrent API requests.
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Confirms when PostgreSQL accepts a connection from the pool.
pool.on("connect", () => {
  console.log("Database connected");
});

// Stops the API if the database pool enters an unrecoverable error state.
pool.on("error", (err) => {
  console.error("Database connection error:", err);
});

module.exports = pool;
