import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST ?? 'db',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME ?? 'maruvayil',
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD,
});

export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}
