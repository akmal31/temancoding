import { Pool } from 'pg';

let pool: Pool | undefined;

if (!pool && process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });
}

export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database is not connected. Missing DATABASE_URL.');
  }
  return pool.query(text, params);
}
