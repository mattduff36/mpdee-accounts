const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSupabaseTables() {
  console.log('🔍 Checking Supabase database tables...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    
    // Check if tables exist by trying to query them
    const tables = [
      'clients',
      'invoices', 
      'invoice_items',
      'expenses',
      'bank_statement_imports',
      'bank_transactions'
    ];
    
    console.log('\n📋 Checking table existence:');
    
    for (const table of tables) {
      try {
        // Try to get count from each table
        let count = 0;
        switch (table) {
          case 'clients':
            count = await prisma.client.count();
            break;
          case 'invoices':
            count = await prisma.invoice.count();
            break;
          case 'invoice_items':
            count = await prisma.invoiceItem.count();
            break;
          case 'expenses':
            count = await prisma.expense.count();
            break;
          case 'bank_statement_imports':
            count = await prisma.bankStatementImport.count();
            break;
          case 'bank_transactions':
            count = await prisma.bankTransaction.count();
            break;
        }
        console.log(`✅ ${table}: EXISTS (${count} records)`);
      } catch (error) {
        if (error.code === 'P2021') {
          console.log(`❌ ${table}: DOES NOT EXIST`);
        } else {
          console.log(`⚠️  ${table}: ERROR - ${error.message}`);
        }
      }
    }
    
    console.log('\n📊 Summary:');
    console.log('- If tables show "DOES NOT EXIST", we need to create them');
    console.log('- If tables show "EXISTS", they are ready for data migration');
    
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSupabaseTables();
