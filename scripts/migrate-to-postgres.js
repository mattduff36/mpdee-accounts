const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite database path
const sqlitePath = path.join(__dirname, '../prisma/dev.db');

// Create SQLite connection
const sqliteDb = new sqlite3.Database(sqlitePath);

// Create Prisma client (will use DATABASE_URL from environment)
const prisma = new PrismaClient();

async function migrateData() {
  console.log('Starting migration from SQLite to PostgreSQL...');
  
  try {
    // Test PostgreSQL connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Test SQLite connection
    sqliteDb.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
      if (err) {
        console.error('❌ Failed to connect to SQLite:', err);
        return;
      }
      console.log('✅ Connected to SQLite');
      
      // Migrate clients
      migrateClients();
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

function migrateClients() {
  console.log('📦 Migrating clients...');
  
  sqliteDb.all("SELECT * FROM clients", async (err, clients) => {
    if (err) {
      console.error('❌ Failed to fetch clients from SQLite:', err);
      return;
    }
    
    for (const client of clients) {
      try {
        await prisma.client.create({
          data: {
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            billing_address: client.billing_address,
            notes: client.notes,
            image_url: client.image_url,
            created_at: new Date(client.created_at),
            updated_at: new Date(client.updated_at),
          },
        });
        console.log(`✅ Migrated client: ${client.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Client ${client.name} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to migrate client ${client.name}:`, error);
        }
      }
    }
    
    // Continue with invoices
    migrateInvoices();
  });
}

function migrateInvoices() {
  console.log('📦 Migrating invoices...');
  
  sqliteDb.all("SELECT * FROM invoices", async (err, invoices) => {
    if (err) {
      console.error('❌ Failed to fetch invoices from SQLite:', err);
      return;
    }
    
    for (const invoice of invoices) {
      try {
        await prisma.invoice.create({
          data: {
            id: invoice.id,
            client_id: invoice.client_id,
            invoice_number: invoice.invoice_number,
            status: invoice.status,
            total_amount: invoice.total_amount,
            sent_date: invoice.sent_date ? new Date(invoice.sent_date) : null,
            due_date: invoice.due_date ? new Date(invoice.due_date) : null,
            paid_date: invoice.paid_date ? new Date(invoice.paid_date) : null,
            created_at: new Date(invoice.created_at),
            updated_at: new Date(invoice.updated_at),
          },
        });
        console.log(`✅ Migrated invoice: ${invoice.invoice_number}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Invoice ${invoice.invoice_number} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to migrate invoice ${invoice.invoice_number}:`, error);
        }
      }
    }
    
    // Continue with invoice items
    migrateInvoiceItems();
  });
}

function migrateInvoiceItems() {
  console.log('📦 Migrating invoice items...');
  
  sqliteDb.all("SELECT * FROM invoice_items", async (err, items) => {
    if (err) {
      console.error('❌ Failed to fetch invoice items from SQLite:', err);
      return;
    }
    
    for (const item of items) {
      try {
        await prisma.invoiceItem.create({
          data: {
            id: item.id,
            invoice_id: item.invoice_id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            total: item.total,
            agency_commission: item.agency_commission,
            business_area: item.business_area,
            created_at: new Date(item.created_at),
          },
        });
        console.log(`✅ Migrated invoice item: ${item.description}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Invoice item ${item.id} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to migrate invoice item ${item.id}:`, error);
        }
      }
    }
    
    // Continue with expenses
    migrateExpenses();
  });
}

function migrateExpenses() {
  console.log('📦 Migrating expenses...');
  
  sqliteDb.all("SELECT * FROM expenses", async (err, expenses) => {
    if (err) {
      console.error('❌ Failed to fetch expenses from SQLite:', err);
      return;
    }
    
    for (const expense of expenses) {
      try {
        await prisma.expense.create({
          data: {
            id: expense.id,
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: new Date(expense.date),
            receipt_url: expense.receipt_url,
            notes: expense.notes,
            created_at: new Date(expense.created_at),
            updated_at: new Date(expense.updated_at),
          },
        });
        console.log(`✅ Migrated expense: ${expense.description}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Expense ${expense.id} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to migrate expense ${expense.id}:`, error);
        }
      }
    }
    
    // Continue with bank statement imports
    migrateBankImports();
  });
}

function migrateBankImports() {
  console.log('📦 Migrating bank statement imports...');
  
  sqliteDb.all("SELECT * FROM bank_statement_imports", async (err, imports) => {
    if (err) {
      console.log('ℹ️  No bank statement imports to migrate');
      finishMigration();
      return;
    }
    
    for (const import_ of imports) {
      try {
        await prisma.bankStatementImport.create({
          data: {
            id: import_.id,
            filename: import_.filename,
            uploaded_at: new Date(import_.uploaded_at),
          },
        });
        console.log(`✅ Migrated bank import: ${import_.filename}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Bank import ${import_.id} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to migrate bank import ${import_.id}:`, error);
        }
      }
    }
    
    // Continue with bank transactions
    migrateBankTransactions();
  });
}

function migrateBankTransactions() {
  console.log('📦 Migrating bank transactions...');
  
  sqliteDb.all("SELECT * FROM bank_transactions", async (err, transactions) => {
    if (err) {
      console.log('ℹ️  No bank transactions to migrate');
      finishMigration();
      return;
    }
    
    for (const transaction of transactions) {
      try {
        await prisma.bankTransaction.create({
          data: {
            id: transaction.id,
            import_id: transaction.import_id,
            date: new Date(transaction.date),
            description: transaction.description,
            amount: transaction.amount,
            raw: transaction.raw ? JSON.parse(transaction.raw) : null,
            status: transaction.status,
            expense_id: transaction.expense_id,
          },
        });
        console.log(`✅ Migrated bank transaction: ${transaction.description}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Bank transaction ${transaction.id} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to migrate bank transaction ${transaction.id}:`, error);
        }
      }
    }
    
    finishMigration();
  });
}

async function finishMigration() {
  console.log('\n🎉 Migration completed!');
  
  // Close connections
  sqliteDb.close();
  await prisma.$disconnect();
  
  console.log('✅ Database connections closed');
  process.exit(0);
}

// Run migration
migrateData();
