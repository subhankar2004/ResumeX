import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import pool from '../config/database';

const MIGRATIONS_DIR = join(__dirname, '../../migrations');
const INITIAL_MIGRATION = '001_initial_schema.sql';

// Apply every migrations/*.sql file not yet recorded in schema_migrations, in filename order
export const runMigrations = async (): Promise<void> => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       filename TEXT PRIMARY KEY,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     )`
  );

  const result = await pool.query('SELECT filename FROM schema_migrations');
  const applied = new Set<string>(result.rows.map((row) => row.filename));

  // Databases created before migrations were tracked already contain the initial schema
  if (!applied.has(INITIAL_MIGRATION)) {
    const existing = await pool.query(`SELECT to_regclass('public.users') IS NOT NULL AS exists`);
    if (existing.rows[0].exists) {
      await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [INITIAL_MIGRATION]);
      applied.add(INITIAL_MIGRATION);
    }
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✓ Applied migration ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};
