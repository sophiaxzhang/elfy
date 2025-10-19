import db from './src/config/db.js';

async function createPaymentTransactionsTable() {
  try {
    console.log('Creating payment_transactions table...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES parent(id) ON DELETE CASCADE,
        payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'pull_funds', 'push_funds', 'refund', etc.
        status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'cancelled'
        transaction_id VARCHAR(255) UNIQUE NOT NULL,
        external_reference VARCHAR(255), -- Reference from payment processor
        response_data JSONB, -- Full response from payment processor
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ payment_transactions table created successfully!');
    
    // Create indexes for faster queries
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id 
      ON payment_transactions(user_id)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id 
      ON payment_transactions(transaction_id)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_status 
      ON payment_transactions(status)
    `);
    
    console.log('✅ Indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await db.end();
  }
}

createPaymentTransactionsTable();
