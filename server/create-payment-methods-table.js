import db from './src/config/db.js';

async function createPaymentMethodsTable() {
  try {
    console.log('Creating payment_methods table...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        card_number VARCHAR(500) NOT NULL, -- Encrypted card number
        expiry_date VARCHAR(4) NOT NULL, -- MMYY format
        cvv VARCHAR(500) NOT NULL, -- Encrypted CVV
        cardholder_name VARCHAR(255) NOT NULL,
        billing_address TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ payment_methods table created successfully!');
    
    // Create index for faster queries
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id 
      ON payment_methods(user_id)
    `);
    
    console.log('✅ Index created successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await db.end();
  }
}

createPaymentMethodsTable();
