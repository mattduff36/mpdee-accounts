const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInvoiceItemsTableSchema() {
  console.log('🔍 Checking invoice_items table schema...\n');
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Get table schema
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'invoice_items' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const result = await prisma.$queryRawUnsafe(schemaQuery);
    console.log('📋 Invoice items table schema:');
    console.table(result);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkInvoiceItemsTableSchema();
