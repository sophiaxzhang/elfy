import db from '../config/db.js';

export async function up() {
  try {
    console.log('Adding status column to chore table...');
    
    // Check if status column already exists
    const columnExists = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'chore' AND column_name = 'status'
    `);
    
    if (columnExists.rows.length === 0) {
      await db.query(`
        ALTER TABLE chore 
        ADD COLUMN status INTEGER DEFAULT 0
      `);
      console.log('✅ Status column added to chore table');
    } else {
      console.log('✅ Status column already exists in chore table');
    }
  } catch (error) {
    console.error('Error adding status column:', error);
    throw error;
  }
}

export async function down() {
  try {
    console.log('Removing status column from chore table...');
    await db.query(`
      ALTER TABLE chore 
      DROP COLUMN IF EXISTS status
    `);
    console.log('✅ Status column removed from chore table');
  } catch (error) {
    console.error('Error removing status column:', error);
    throw error;
  }
}

// Run the migration
up().catch(console.error);
