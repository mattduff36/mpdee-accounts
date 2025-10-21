/**
 * Migration script to move database from Supabase to Neon
 * 
 * This script:
 * 1. Creates schema on new Neon database
 * 2. Copies all data from Supabase to Neon
 * 3. Verifies data integrity
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

// Source database (Supabase)
const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL
    }
  }
});

// Target database (Neon)
const targetDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.NEON_DATABASE_URL
    }
  }
});

async function createSchema() {
  console.log('\n📋 Step 1: Creating schema on Neon database...\n');
  
  // We'll use raw SQL to create the schema
  const schema = `
    -- Create enums
    CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE');
    CREATE TYPE "BusinessArea" AS ENUM ('CREATIVE', 'DEVELOPMENT', 'SUPPORT');
    CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'ADDED', 'IGNORED');

    -- Create clients table
    CREATE TABLE "clients" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "phone" TEXT,
      "billing_address" TEXT,
      "notes" TEXT,
      "image_url" TEXT,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL
    );

    -- Create invoices table
    CREATE TABLE "invoices" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "client_id" TEXT NOT NULL,
      "invoice_number" TEXT NOT NULL UNIQUE,
      "issue_date" TIMESTAMP(3) NOT NULL,
      "due_date" TIMESTAMP(3),
      "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
      "notes" TEXT,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL,
      "sent_date" TIMESTAMP(3),
      "paid_date" TIMESTAMP(3),
      CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- Create invoice_items table
    CREATE TABLE "invoice_items" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "invoice_id" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "unit_price" DOUBLE PRECISION NOT NULL,
      "total_price" DOUBLE PRECISION NOT NULL,
      "rate" DOUBLE PRECISION,
      "total" DOUBLE PRECISION,
      "agency_commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "business_area" "BusinessArea" NOT NULL DEFAULT 'CREATIVE',
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- Create expenses table
    CREATE TABLE "expenses" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "description" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL,
      "category" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "receipt_url" TEXT,
      "notes" TEXT,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL
    );

    -- Create bank_statement_imports table
    CREATE TABLE "bank_statement_imports" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "filename" TEXT,
      "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Create bank_transactions table
    CREATE TABLE "bank_transactions" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "import_id" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "description" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL,
      "raw" JSONB,
      "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
      "expense_id" TEXT,
      CONSTRAINT "bank_transactions_import_id_fkey" FOREIGN KEY ("import_id") REFERENCES "bank_statement_imports"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- Create indexes
    CREATE INDEX "invoices_client_id_idx" ON "invoices"("client_id");
    CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");
    CREATE INDEX "bank_transactions_import_id_idx" ON "bank_transactions"("import_id");
  `;

  try {
    // Check if schema already exists
    const existingTables = await targetDb.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'clients';
    `;

    if (existingTables.length > 0) {
      console.log('⚠️  Schema already exists on Neon database. Skipping schema creation.');
      console.log('   If you want to recreate the schema, manually drop all tables first.\n');
      return;
    }

    // Split and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await targetDb.$executeRawUnsafe(statement);
    }

    console.log('✅ Schema created successfully on Neon database\n');
  } catch (error) {
    if (error.code === '42710' || error.message.includes('already exists')) {
      console.log('⚠️  Schema already exists. Continuing with data migration...\n');
    } else {
      console.error('❌ Error creating schema:', error.message);
      throw error;
    }
  }
}

async function migrateData() {
  console.log('📦 Step 2: Migrating data from Supabase to Neon...\n');

  try {
    // 1. Migrate Clients
    console.log('  → Migrating clients...');
    const clients = await sourceDb.client.findMany();
    console.log(`    Found ${clients.length} clients`);
    
    for (const client of clients) {
      await targetDb.client.upsert({
        where: { id: client.id },
        create: client,
        update: client
      });
    }
    console.log(`    ✓ Migrated ${clients.length} clients\n`);

    // 2. Migrate Invoices
    console.log('  → Migrating invoices...');
    const invoices = await sourceDb.invoice.findMany();
    console.log(`    Found ${invoices.length} invoices`);
    
    for (const invoice of invoices) {
      await targetDb.invoice.upsert({
        where: { id: invoice.id },
        create: invoice,
        update: invoice
      });
    }
    console.log(`    ✓ Migrated ${invoices.length} invoices\n`);

    // 3. Migrate Invoice Items
    console.log('  → Migrating invoice items...');
    const invoiceItems = await sourceDb.invoiceItem.findMany();
    console.log(`    Found ${invoiceItems.length} invoice items`);
    
    for (const item of invoiceItems) {
      await targetDb.invoiceItem.upsert({
        where: { id: item.id },
        create: item,
        update: item
      });
    }
    console.log(`    ✓ Migrated ${invoiceItems.length} invoice items\n`);

    // 4. Migrate Expenses
    console.log('  → Migrating expenses...');
    const expenses = await sourceDb.expense.findMany();
    console.log(`    Found ${expenses.length} expenses`);
    
    for (const expense of expenses) {
      await targetDb.expense.upsert({
        where: { id: expense.id },
        create: expense,
        update: expense
      });
    }
    console.log(`    ✓ Migrated ${expenses.length} expenses\n`);

    // 5. Migrate Bank Statement Imports
    console.log('  → Migrating bank statement imports...');
    const imports = await sourceDb.bankStatementImport.findMany();
    console.log(`    Found ${imports.length} imports`);
    
    for (const imp of imports) {
      await targetDb.bankStatementImport.upsert({
        where: { id: imp.id },
        create: imp,
        update: imp
      });
    }
    console.log(`    ✓ Migrated ${imports.length} bank statement imports\n`);

    // 6. Migrate Bank Transactions
    console.log('  → Migrating bank transactions...');
    const transactions = await sourceDb.bankTransaction.findMany();
    console.log(`    Found ${transactions.length} transactions`);
    
    for (const transaction of transactions) {
      await targetDb.bankTransaction.upsert({
        where: { id: transaction.id },
        create: transaction,
        update: transaction
      });
    }
    console.log(`    ✓ Migrated ${transactions.length} bank transactions\n`);

    console.log('✅ All data migrated successfully!\n');

  } catch (error) {
    console.error('❌ Error migrating data:', error);
    throw error;
  }
}

async function verifyMigration() {
  console.log('🔍 Step 3: Verifying migration...\n');

  try {
    // Count records in both databases
    const sourceCounts = {
      clients: await sourceDb.client.count(),
      invoices: await sourceDb.invoice.count(),
      invoiceItems: await sourceDb.invoiceItem.count(),
      expenses: await sourceDb.expense.count(),
      imports: await sourceDb.bankStatementImport.count(),
      transactions: await sourceDb.bankTransaction.count()
    };

    const targetCounts = {
      clients: await targetDb.client.count(),
      invoices: await targetDb.invoice.count(),
      invoiceItems: await targetDb.invoiceItem.count(),
      expenses: await targetDb.expense.count(),
      imports: await targetDb.bankStatementImport.count(),
      transactions: await targetDb.bankTransaction.count()
    };

    console.log('  Record counts:');
    console.log('  ┌─────────────────────────┬────────┬────────┬────────┐');
    console.log('  │ Table                   │ Source │ Target │ Status │');
    console.log('  ├─────────────────────────┼────────┼────────┼────────┤');
    
    let allMatch = true;
    for (const [key, sourceCount] of Object.entries(sourceCounts)) {
      const targetCount = targetCounts[key];
      const status = sourceCount === targetCount ? '✓' : '✗';
      if (sourceCount !== targetCount) allMatch = false;
      
      console.log(`  │ ${key.padEnd(23)} │ ${String(sourceCount).padStart(6)} │ ${String(targetCount).padStart(6)} │   ${status}    │`);
    }
    console.log('  └─────────────────────────┴────────┴────────┴────────┘\n');

    if (allMatch) {
      console.log('✅ Verification successful! All records match.\n');
    } else {
      console.log('⚠️  Warning: Record counts do not match. Please investigate.\n');
      throw new Error('Migration verification failed');
    }

  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    throw error;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Database Migration: Supabase → Neon                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Test connections
    console.log('🔌 Testing database connections...\n');
    await sourceDb.$connect();
    console.log('  ✓ Connected to Supabase (source)');
    await targetDb.$connect();
    console.log('  ✓ Connected to Neon (target)\n');

    // Execute migration steps
    await createSchema();
    await migrateData();
    await verifyMigration();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  Migration Complete! 🎉                                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('Next steps:');
    console.log('1. Test the application with the new database');
    console.log('2. Update .env.local to use NEON_DATABASE_URL');
    console.log('3. Keep Supabase as backup for a few days');
    console.log('4. Once confident, you can decommission Supabase\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sourceDb.$disconnect();
    await targetDb.$disconnect();
  }
}

// Run the migration
main();

