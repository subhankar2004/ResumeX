import { runMigrations as applyMigrations } from '../utils/migrations';

const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');

    await applyMigrations();

    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
