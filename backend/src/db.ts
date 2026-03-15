import pg from 'pg';

const { Pool } = pg;

// DATABASE_URL takes precedence (used by Neon, Render, Railway, etc.)
// Falls back to individual DB_* vars for local / Docker Compose usage
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // required by Neon
    })
  : new Pool({
      host: process.env.DB_HOST ?? 'db',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: process.env.DB_NAME ?? 'maruvayil',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD,
    });

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}
