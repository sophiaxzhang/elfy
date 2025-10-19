import db from './src/config/db.js';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0]);
    
    // Check if parent table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'parent'
      );
    `);
    
    console.log('Parent table exists:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Parent table created successfully!');
    }
    
    // Check if child table exists
    const childTableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'child'
      );
    `);
    
    console.log('Child table exists:', childTableCheck.rows[0].exists);
    
    if (!childTableCheck.rows[0].exists) {
      console.log('Creating child table...');
      await db.query(`
        CREATE TABLE IF NOT EXISTS child (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          parent_id INTEGER REFERENCES parent(id) ON DELETE CASCADE,
          gem INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Child table created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await db.end();
  }
}

testDatabase();
