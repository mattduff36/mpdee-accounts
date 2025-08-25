const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema to match Prisma...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    
    // Fix clients table
    console.log('📋 Fixing clients table...');
    const clientFixes = [
      `ALTER TABLE "public"."clients" ADD COLUMN IF NOT EXISTS "billing_address" TEXT;`,
      `ALTER TABLE "public"."clients" ADD COLUMN IF NOT EXISTS "notes" TEXT;`
    ];
    
    for (const fix of clientFixes) {
      await prisma.$executeRawUnsafe(fix);
    }
    console.log('✅ Clients table fixed');
    
    // Fix invoices table
    console.log('📄 Fixing invoices table...');
    const invoiceFixes = [
      `ALTER TABLE "public"."invoices" ADD COLUMN IF NOT EXISTS "issue_date" TIMESTAMP(3);`,
      `ALTER TABLE "public"."invoices" ADD COLUMN IF NOT EXISTS "notes" TEXT;`
    ];
    
    for (const fix of invoiceFixes) {
      await prisma.$executeRawUnsafe(fix);
    }
    console.log('✅ Invoices table fixed');
    
    // Fix invoice_items table
    console.log('📝 Fixing invoice_items table...');
    const invoiceItemFixes = [
      `ALTER TABLE "public"."invoice_items" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];
    
    for (const fix of invoiceItemFixes) {
      await prisma.$executeRawUnsafe(fix);
    }
    console.log('✅ Invoice items table fixed');
    
    // Fix expenses table
    console.log('💰 Fixing expenses table...');
    const expenseFixes = [
      `ALTER TABLE "public"."expenses" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];
    
    for (const fix of expenseFixes) {
      await prisma.$executeRawUnsafe(fix);
    }
    console.log('✅ Expenses table fixed');
    
    // Fix bank_statement_imports table
    console.log('🏦 Fixing bank_statement_imports table...');
    const bankImportFixes = [
      `ALTER TABLE "public"."bank_statement_imports" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];
    
    for (const fix of bankImportFixes) {
      await prisma.$executeRawUnsafe(fix);
    }
    console.log('✅ Bank imports table fixed');
    
    console.log('\n🎉 All database tables fixed to match Prisma schema!');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseSchema();
