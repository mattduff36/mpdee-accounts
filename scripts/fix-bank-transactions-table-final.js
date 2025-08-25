const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBankTransactionsTable() {
  console.log('🔧 Fixing bank_transactions table to match Prisma schema...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    
    // Remove the updated_at column from bank_transactions table
    console.log('📋 Removing updated_at column from bank_transactions table...');
    
    const alterTableSQL = `
      ALTER TABLE "public"."bank_transactions" 
      DROP COLUMN IF EXISTS "updated_at";
    `;
    
    await prisma.$executeRawUnsafe(alterTableSQL);
    console.log('✅ Removed updated_at column from bank_transactions table');
    
    console.log('\n🎉 Bank transactions table now matches Prisma schema!');
    
  } catch (error) {
    console.error('❌ Error fixing table:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixBankTransactionsTable();
