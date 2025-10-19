import { createTables } from './migrations/20250119_create_elfly_tables.js';

// Run the migration
createTables()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
