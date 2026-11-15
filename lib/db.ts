import { Pool, neonConfig } from "@neondatabase/serverless";
import WebSocket from "ws";

// Configure WebSocket support for Node.js.
neonConfig.webSocketConstructor = WebSocket;

// Make sure the database connection string exists.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

// Reuse the connection pool during development.
const globalForPostgres = globalThis as typeof globalThis & {
  postgresPool?: Pool;
};

const pool =
  globalForPostgres.postgresPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.postgresPool = pool;
}

export default pool;
