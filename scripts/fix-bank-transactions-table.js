const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBankTransactionsTable() {
  console.log('🔧 Fixing bank_transactions table...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    
    // Add the missing 'raw' column to bank_transactions table
    console.log('📋 Adding missing columns to bank_transactions table...');
    
    const alterTableSQL = `
      ALTER TABLE "public"."bank_transactions" 
      ADD COLUMN IF NOT EXISTS "raw" JSONB,
      ADD COLUMN IF NOT EXISTS "expense_id" TEXT;
    `;
    
    await prisma.$executeRawUnsafe(alterTableSQL);
    console.log('✅ Added missing columns to bank_transactions table');
    
    // Also fix the invoices table to match the schema
    const alterInvoicesSQL = `
      ALTER TABLE "public"."invoices" 
      ADD COLUMN IF NOT EXISTS "sent_date" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "paid_date" TIMESTAMP(3);
    `;
    
    await prisma.$executeRawUnsafe(alterInvoicesSQL);
    console.log('✅ Added missing columns to invoices table');
    
    // Fix invoice_items table
    const alterInvoiceItemsSQL = `
      ALTER TABLE "public"."invoice_items" 
      ADD COLUMN IF NOT EXISTS "rate" DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS "total" DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS "agency_commission" DECIMAL(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "business_area" TEXT DEFAULT 'CREATIVE';
    `;
    
    await prisma.$executeRawUnsafe(alterInvoiceItemsSQL);
    console.log('✅ Added missing columns to invoice_items table');
    
    // Fix expenses table
    const alterExpensesSQL = `
      ALTER TABLE "public"."expenses" 
      ADD COLUMN IF NOT EXISTS "notes" TEXT;
    `;
    
    await prisma.$executeRawUnsafe(alterExpensesSQL);
    console.log('✅ Added missing columns to expenses table');
    
    // Fix bank_statement_imports table
    const alterBankImportsSQL = `
      ALTER TABLE "public"."bank_statement_imports" 
      ADD COLUMN IF NOT EXISTS "uploaded_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
    `;
    
    await prisma.$executeRawUnsafe(alterBankImportsSQL);
    console.log('✅ Added missing columns to bank_statement_imports table');
    
    console.log('\n🎉 All tables updated to match Prisma schema!');
    
  } catch (error) {
    console.error('❌ Error fixing tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixBankTransactionsTable();
