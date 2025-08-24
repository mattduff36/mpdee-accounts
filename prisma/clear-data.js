const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all data from database...');

  // Delete all data in the correct order to respect foreign key constraints
  await prisma.bankTransaction.deleteMany();
  console.log('✓ Cleared bank transactions');

  await prisma.bankStatementImport.deleteMany();
  console.log('✓ Cleared bank statement imports');

  await prisma.invoiceItem.deleteMany();
  console.log('✓ Cleared invoice items');

  await prisma.invoice.deleteMany();
  console.log('✓ Cleared invoices');

  await prisma.expense.deleteMany();
  console.log('✓ Cleared expenses');

  await prisma.client.deleteMany();
  console.log('✓ Cleared clients');

  console.log('All data cleared successfully!');
}

main()
  .catch((e) => {
    console.error('Error clearing data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
