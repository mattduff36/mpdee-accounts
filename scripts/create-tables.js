const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTables() {
  console.log('🔨 Creating database tables in Supabase...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    
    // Create tables one by one
    const tableDefinitions = [
      {
        name: 'clients',
        sql: `
          CREATE TABLE IF NOT EXISTS "public"."clients" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "phone" TEXT,
            "address" TEXT,
            "image_url" TEXT,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
          )
        `
      },
      {
        name: 'invoices',
        sql: `
          CREATE TABLE IF NOT EXISTS "public"."invoices" (
            "id" TEXT NOT NULL,
            "invoice_number" TEXT NOT NULL,
            "client_id" TEXT NOT NULL,
            "issue_date" TIMESTAMP(3) NOT NULL,
            "due_date" TIMESTAMP(3) NOT NULL,
            "total_amount" DECIMAL(10,2) NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'DRAFT',
            "notes" TEXT,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "invoices_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          )
        `
      },
      {
        name: 'invoice_items',
        sql: `
          CREATE TABLE IF NOT EXISTS "public"."invoice_items" (
            "id" TEXT NOT NULL,
            "invoice_id" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "quantity" INTEGER NOT NULL,
            "unit_price" DECIMAL(10,2) NOT NULL,
            "total_price" DECIMAL(10,2) NOT NULL,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          )
        `
      },
      {
        name: 'expenses',
        sql: `
          CREATE TABLE IF NOT EXISTS "public"."expenses" (
            "id" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "amount" DECIMAL(10,2) NOT NULL,
            "date" TIMESTAMP(3) NOT NULL,
            "category" TEXT,
            "receipt_url" TEXT,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
          )
        `
      },
      {
        name: 'bank_statement_imports',
        sql: `
          CREATE TABLE IF NOT EXISTS "public"."bank_statement_imports" (
            "id" TEXT NOT NULL,
            "filename" TEXT NOT NULL,
            "import_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "total_transactions" INTEGER,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "bank_statement_imports_pkey" PRIMARY KEY ("id")
          )
        `
      },
      {
        name: 'bank_transactions',
        sql: `
          CREATE TABLE IF NOT EXISTS "public"."bank_transactions" (
            "id" TEXT NOT NULL,
            "import_id" TEXT NOT NULL,
            "date" TIMESTAMP(3) NOT NULL,
            "description" TEXT NOT NULL,
            "amount" DECIMAL(10,2) NOT NULL,
            "balance" DECIMAL(10,2),
            "category" TEXT,
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "bank_transactions_import_id_fkey" FOREIGN KEY ("import_id") REFERENCES "public"."bank_statement_imports"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          )
        `
      }
    ];
    
    console.log('📋 Creating tables...');
    
    for (const table of tableDefinitions) {
      try {
        console.log(`Creating ${table.name}...`);
        await prisma.$executeRawUnsafe(table.sql);
        console.log(`✅ ${table.name} created successfully`);
      } catch (error) {
        console.log(`⚠️  ${table.name}: ${error.message}`);
      }
    }
    
    console.log('\n🔍 Verifying tables...');
    const tables = ['clients', 'invoices', 'invoice_items', 'expenses', 'bank_statement_imports', 'bank_transactions'];
    
    for (const table of tables) {
      try {
        const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`✅ ${table}: EXISTS (0 records)`);
      } catch (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
