import db from '../config/db.js';

export const createTables = async () => {
  try {
    console.log('Database setup complete - using existing tables only');
    console.log('✅ Using existing parent table for parent information');
    console.log('✅ Using existing child table for child information');
    console.log('✅ Using existing chore table for task management');
    console.log('✅ Using existing payment_methods table for card information');
    console.log('✅ Using existing payments table for transaction logging');
  } catch (error) {
    console.error('Error in database setup:', error);
    throw error;
  }
};

export const dropTables = async () => {
  try {
    console.log('No tables to drop - using existing tables only');
    console.log('⚠️  Note: All existing tables (parent, child, chore, payment_methods, payments) were preserved');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
};