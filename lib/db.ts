import { Pool } from 'pg';

let pool: Pool | undefined;

if (!pool && process.env.DATABASE_URL) {
  const config: any = {
    connectionString: process.env.DATABASE_URL,
  };

  // Only enable SSL if it is not explicitly disabled via URL or ENV
  const disableSsl = process.env.DATABASE_URL.includes('sslmode=disable') || process.env.DISABLE_DB_SSL === 'true';

  if (process.env.NODE_ENV === 'production' && !disableSsl) {
    config.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(config);
}

export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database is not connected. Missing DATABASE_URL.');
  }
  return pool.query(text, params);
}
