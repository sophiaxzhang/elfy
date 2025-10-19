import db from './src/config/db.js';

async function addParentColumns() {
  try {
    console.log('Checking current parent table structure...');
    
    // Check current columns
    const currentColumns = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'parent'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current parent table columns:');
    currentColumns.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Add new columns if they don't exist
    const newColumns = [
      {
        name: 'children',
        definition: 'JSONB DEFAULT \'[]\''
      },
      {
        name: 'chores', 
        definition: 'JSONB DEFAULT \'[]\''
      },
      {
        name: 'number_of_tokens',
        definition: 'INTEGER DEFAULT 0'
      },
      {
        name: 'gift_card_amount',
        definition: 'DECIMAL(10,2) DEFAULT 0.00'
      },
      {
        name: 'created_at',
        definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
      },
      {
        name: 'updated_at',
        definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
      }
    ];
    
    for (const column of newColumns) {
      const columnExists = currentColumns.rows.some(row => row.column_name === column.name);
      
      if (!columnExists) {
        console.log(`Adding column: ${column.name}`);
        await db.query(`ALTER TABLE parent ADD COLUMN ${column.name} ${column.definition}`);
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`Column ${column.name} already exists, skipping...`);
      }
    }
    
    // Create index for faster queries if it doesn't exist
    try {
      await db.query(`CREATE INDEX IF NOT EXISTS idx_parent_email ON parent(email)`);
      console.log('✅ Email index created/verified');
    } catch (error) {
      console.log('Index might already exist:', error.message);
    }
    
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

addParentColumns();
