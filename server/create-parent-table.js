import db from './src/config/db.js';

async function createParentTable() {
  try {
    console.log('Creating parent table...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS parent (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        pin VARCHAR(10),
        name VARCHAR(100) NOT NULL,
        children JSONB DEFAULT '[]',
        chores JSONB DEFAULT '[]',
        number_of_tokens INTEGER DEFAULT 0,
        gift_card_amount DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ parent table created successfully!');
    
    // Create index for faster queries
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_parent_email 
      ON parent(email)
    `);
    
    console.log('✅ Index created successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await db.end();
  }
}

createParentTable();
