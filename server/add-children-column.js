import db from './src/config/db.js';

async function addChildrenColumn() {
  try {
    console.log('Adding children column to parent table...');
    
    // Add children column as JSONB array
    await db.query(`ALTER TABLE parent ADD COLUMN children JSONB DEFAULT '[]'`);
    console.log('✅ Added children column');
    
    console.log('\n✅ Parent table update completed!');
    
    // Show final structure
    const finalColumns = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'parent'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nFinal parent table structure:');
    finalColumns.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating parent table:', error);
  } finally {
    await db.end();
  }
}

addChildrenColumn();
