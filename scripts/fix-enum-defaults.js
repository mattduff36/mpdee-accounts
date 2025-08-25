const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEnumDefaults() {
  console.log('🔧 Fixing enum default values...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    
    // Fix enum columns by dropping defaults and recreating them
    const fixCommands = [
      {
        name: 'invoices.status',
        commands: [
          `ALTER TABLE "public"."invoices" ALTER COLUMN "status" DROP DEFAULT;`,
          `ALTER TABLE "public"."invoices" ALTER COLUMN "status" TYPE "public"."InvoiceStatus" USING "status"::"public"."InvoiceStatus";`,
          `ALTER TABLE "public"."invoices" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"public"."InvoiceStatus";`
        ]
      },
      {
        name: 'invoice_items.business_area',
        commands: [
          `ALTER TABLE "public"."invoice_items" ALTER COLUMN "business_area" DROP DEFAULT;`,
          `ALTER TABLE "public"."invoice_items" ALTER COLUMN "business_area" TYPE "public"."BusinessArea" USING "business_area"::"public"."BusinessArea";`,
          `ALTER TABLE "public"."invoice_items" ALTER COLUMN "business_area" SET DEFAULT 'CREATIVE'::"public"."BusinessArea";`
        ]
      },
      {
        name: 'bank_transactions.status',
        commands: [
          `ALTER TABLE "public"."bank_transactions" ALTER COLUMN "status" DROP DEFAULT;`,
          `ALTER TABLE "public"."bank_transactions" ALTER COLUMN "status" TYPE "public"."TransactionStatus" USING "status"::"public"."TransactionStatus";`,
          `ALTER TABLE "public"."bank_transactions" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"public"."TransactionStatus";`
        ]
      }
    ];
    
    console.log('📋 Fixing enum columns...');
    
    for (const fix of fixCommands) {
      try {
        console.log(`Fixing ${fix.name}...`);
        for (const command of fix.commands) {
          await prisma.$executeRawUnsafe(command);
        }
        console.log(`✅ ${fix.name} fixed successfully`);
      } catch (error) {
        console.log(`⚠️  ${fix.name}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 All enum columns fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing enums:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnumDefaults();
