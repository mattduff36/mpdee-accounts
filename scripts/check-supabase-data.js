const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSupabaseData() {
  console.log('🔍 Checking Supabase database data...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    
    // Check each table
    console.log('📊 Database Contents:');
    
    // Check clients
    const clients = await prisma.client.findMany();
    console.log(`\n📋 CLIENTS (${clients.length} records):`);
    clients.forEach(client => {
      console.log(`  - ${client.name} (${client.email})`);
    });
    
    // Check invoices
    const invoices = await prisma.invoice.findMany({
      include: { client: true }
    });
    console.log(`\n📄 INVOICES (${invoices.length} records):`);
    invoices.forEach(invoice => {
      console.log(`  - ${invoice.invoice_number} for ${invoice.client?.name || 'Unknown'} - £${invoice.total_amount} (${invoice.status})`);
    });
    
    // Check invoice items
    const invoiceItems = await prisma.invoiceItem.findMany({
      include: { invoice: true }
    });
    console.log(`\n📝 INVOICE ITEMS (${invoiceItems.length} records):`);
    invoiceItems.forEach(item => {
      console.log(`  - ${item.description} - £${item.total} (Invoice: ${item.invoice?.invoice_number || 'Unknown'})`);
    });
    
    // Check expenses
    const expenses = await prisma.expense.findMany();
    console.log(`\n💰 EXPENSES (${expenses.length} records):`);
    expenses.slice(0, 5).forEach(expense => {
      console.log(`  - ${expense.description} - £${expense.amount} (${expense.date.toDateString()})`);
    });
    if (expenses.length > 5) {
      console.log(`  ... and ${expenses.length - 5} more`);
    }
    
    // Check bank imports
    const bankImports = await prisma.bankStatementImport.findMany();
    console.log(`\n🏦 BANK IMPORTS (${bankImports.length} records):`);
    bankImports.forEach(import_ => {
      console.log(`  - ${import_.filename} (${import_.uploaded_at.toDateString()})`);
    });
    
    // Check bank transactions
    const bankTransactions = await prisma.bankTransaction.findMany();
    console.log(`\n💳 BANK TRANSACTIONS (${bankTransactions.length} records):`);
    bankTransactions.slice(0, 5).forEach(transaction => {
      console.log(`  - ${transaction.description} - £${transaction.amount} (${transaction.date.toDateString()})`);
    });
    if (bankTransactions.length > 5) {
      console.log(`  ... and ${bankTransactions.length - 5} more`);
    }
    
    console.log('\n🎉 Database check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSupabaseData();
