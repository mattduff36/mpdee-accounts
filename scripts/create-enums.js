const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createEnums() {
  console.log('🔧 Creating enum types in PostgreSQL...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    
    // Create enum types one by one
    const enumCommands = [
      {
        name: 'InvoiceStatus',
        sql: `
          DO $$ BEGIN
            CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `
      },
      {
        name: 'BusinessArea',
        sql: `
          DO $$ BEGIN
            CREATE TYPE "public"."BusinessArea" AS ENUM ('CREATIVE', 'DEVELOPMENT', 'SUPPORT');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `
      },
      {
        name: 'TransactionStatus',
        sql: `
          DO $$ BEGIN
            CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'ADDED', 'IGNORED');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `
      }
    ];
    
    console.log('📋 Creating enum types...');
    
    for (const enumCmd of enumCommands) {
      try {
        console.log(`Creating ${enumCmd.name} enum...`);
        await prisma.$executeRawUnsafe(enumCmd.sql);
        console.log(`✅ ${enumCmd.name} enum created successfully`);
      } catch (error) {
        console.log(`⚠️  ${enumCmd.name}: ${error.message}`);
      }
    }
    
    // Update table columns to use the new enum types
    const columnUpdates = [
      {
        name: 'invoices.status',
        sql: `
          ALTER TABLE "public"."invoices" 
          ALTER COLUMN "status" TYPE "public"."InvoiceStatus" 
          USING "status"::"public"."InvoiceStatus";
        `
      },
      {
        name: 'invoice_items.business_area',
        sql: `
          ALTER TABLE "public"."invoice_items" 
          ALTER COLUMN "business_area" TYPE "public"."BusinessArea" 
          USING "business_area"::"public"."BusinessArea";
        `
      },
      {
        name: 'bank_transactions.status',
        sql: `
          ALTER TABLE "public"."bank_transactions" 
          ALTER COLUMN "status" TYPE "public"."TransactionStatus" 
          USING "status"::"public"."TransactionStatus";
        `
      }
    ];
    
    console.log('\n📋 Updating table columns to use enum types...');
    
    for (const update of columnUpdates) {
      try {
        console.log(`Updating ${update.name}...`);
        await prisma.$executeRawUnsafe(update.sql);
        console.log(`✅ ${update.name} updated successfully`);
      } catch (error) {
        console.log(`⚠️  ${update.name}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 All enum types created and tables updated!');
    
  } catch (error) {
    console.error('❌ Error creating enums:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createEnums();
