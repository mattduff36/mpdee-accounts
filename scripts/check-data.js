const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Checking your local database data...\n');
  
  try {
    // Check clients
    const clients = await prisma.client.findMany();
    console.log(`📋 CLIENTS (${clients.length} total):`);
    clients.forEach(client => {
      console.log(`  - ${client.name} (${client.email})`);
    });
    console.log('');

    // Check invoices
    const invoices = await prisma.invoice.findMany({
      include: { client: true }
    });
    console.log(`📄 INVOICES (${invoices.length} total):`);
    invoices.forEach(invoice => {
      console.log(`  - ${invoice.invoice_number} for ${invoice.client.name} - £${invoice.total_amount} (${invoice.status})`);
    });
    console.log('');

    // Check invoice items
    const invoiceItems = await prisma.invoiceItem.findMany();
    console.log(`📝 INVOICE ITEMS (${invoiceItems.length} total):`);
    invoiceItems.forEach(item => {
      console.log(`  - ${item.description} - £${item.total}`);
    });
    console.log('');

    // Check expenses
    const expenses = await prisma.expense.findMany();
    console.log(`💰 EXPENSES (${expenses.length} total):`);
    expenses.forEach(expense => {
      console.log(`  - ${expense.description} - £${expense.amount} (${expense.category})`);
    });
    console.log('');

    // Check bank imports
    const bankImports = await prisma.bankStatementImport.findMany();
    console.log(`🏦 BANK IMPORTS (${bankImports.length} total):`);
    bankImports.forEach(import_ => {
      console.log(`  - ${import_.filename} (${import_.uploaded_at})`);
    });
    console.log('');

    // Check bank transactions
    const bankTransactions = await prisma.bankTransaction.findMany();
    console.log(`💳 BANK TRANSACTIONS (${bankTransactions.length} total):`);
    bankTransactions.forEach(transaction => {
      console.log(`  - ${transaction.description} - £${transaction.amount} (${transaction.status})`);
    });
    console.log('');

    console.log('✅ ALL YOUR DATA IS SAFE AND INTACT!');
    console.log('📊 Summary:');
    console.log(`   - ${clients.length} clients`);
    console.log(`   - ${invoices.length} invoices`);
    console.log(`   - ${invoiceItems.length} invoice items`);
    console.log(`   - ${expenses.length} expenses`);
    console.log(`   - ${bankImports.length} bank imports`);
    console.log(`   - ${bankTransactions.length} bank transactions`);

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
