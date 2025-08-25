const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite database path
const sqlitePath = path.join(__dirname, '../prisma/dev.db');

// Create SQLite connection
const sqliteDb = new sqlite3.Database(sqlitePath);

// Create Prisma client (will use DATABASE_URL from environment)
const prisma = new PrismaClient();

// Helper function to safely parse dates
function safeParseDate(dateString) {
  if (!dateString) return new Date();
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function migrateData() {
  console.log('🔄 Starting data migration from SQLite to PostgreSQL...\n');
  
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
    });
    
    // Migrate clients
    console.log('\n📋 Migrating clients...');
    sqliteDb.all("SELECT * FROM clients", async (err, clients) => {
      if (err) {
        console.error('❌ Error reading clients from SQLite:', err);
        return;
      }
      
      console.log(`Found ${clients.length} clients to migrate`);
      
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
              created_at: safeParseDate(client.created_at),
              updated_at: safeParseDate(client.updated_at)
            }
          });
          console.log(`✅ Migrated client: ${client.name}`);
        } catch (error) {
          console.log(`❌ Failed to migrate client ${client.name}: ${error.message}`);
        }
      }
      
      // Migrate invoices after clients
      migrateInvoices();
    });
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
  }
}

async function migrateInvoices() {
  console.log('\n📄 Migrating invoices...');
  sqliteDb.all("SELECT * FROM invoices", async (err, invoices) => {
    if (err) {
      console.error('❌ Error reading invoices from SQLite:', err);
      return;
    }
    
    console.log(`Found ${invoices.length} invoices to migrate`);
    
    for (const invoice of invoices) {
      try {
        await prisma.invoice.create({
          data: {
            id: invoice.id,
            client_id: invoice.client_id,
            invoice_number: invoice.invoice_number,
            status: invoice.status,
            total_amount: invoice.total_amount,
            sent_date: invoice.sent_date ? safeParseDate(invoice.sent_date) : null,
            due_date: invoice.due_date ? safeParseDate(invoice.due_date) : null,
            paid_date: invoice.paid_date ? safeParseDate(invoice.paid_date) : null,
            created_at: safeParseDate(invoice.created_at),
            updated_at: safeParseDate(invoice.updated_at)
          }
        });
        console.log(`✅ Migrated invoice: ${invoice.invoice_number}`);
      } catch (error) {
        console.log(`❌ Failed to migrate invoice ${invoice.invoice_number}: ${error.message}`);
      }
    }
    
    // Migrate invoice items after invoices
    migrateInvoiceItems();
  });
}

async function migrateInvoiceItems() {
  console.log('\n📝 Migrating invoice items...');
  sqliteDb.all("SELECT * FROM invoice_items", async (err, items) => {
    if (err) {
      console.error('❌ Error reading invoice items from SQLite:', err);
      return;
    }
    
    console.log(`Found ${items.length} invoice items to migrate`);
    
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
            agency_commission: item.agency_commission || 0,
            business_area: item.business_area || 'CREATIVE',
            created_at: safeParseDate(item.created_at),
            updated_at: safeParseDate(item.updated_at)
          }
        });
        console.log(`✅ Migrated invoice item: ${item.description}`);
      } catch (error) {
        console.log(`❌ Failed to migrate invoice item ${item.description}: ${error.message}`);
      }
    }
    
    // Migrate bank imports after invoice items
    migrateBankImports();
  });
}

async function migrateBankImports() {
  console.log('\n🏦 Migrating bank imports...');
  sqliteDb.all("SELECT * FROM bank_statement_imports", async (err, imports) => {
    if (err) {
      console.error('❌ Error reading bank imports from SQLite:', err);
      return;
    }
    
    console.log(`Found ${imports.length} bank imports to migrate`);
    
    for (const import_ of imports) {
      try {
        await prisma.bankStatementImport.create({
          data: {
            id: import_.id,
            filename: import_.filename,
            uploaded_at: safeParseDate(import_.uploaded_at),
            created_at: safeParseDate(import_.created_at),
            updated_at: safeParseDate(import_.updated_at)
          }
        });
        console.log(`✅ Migrated bank import: ${import_.filename}`);
      } catch (error) {
        console.log(`❌ Failed to migrate bank import ${import_.filename}: ${error.message}`);
      }
    }
    
    // Migrate bank transactions after bank imports
    migrateBankTransactions();
  });
}

async function migrateBankTransactions() {
  console.log('\n💳 Migrating bank transactions...');
  sqliteDb.all("SELECT * FROM bank_transactions", async (err, transactions) => {
    if (err) {
      console.error('❌ Error reading bank transactions from SQLite:', err);
      return;
    }
    
    console.log(`Found ${transactions.length} bank transactions to migrate`);
    
    for (const transaction of transactions) {
      try {
        await prisma.bankTransaction.create({
          data: {
            id: transaction.id,
            import_id: transaction.import_id,
            date: safeParseDate(transaction.date),
            description: transaction.description,
            amount: transaction.amount,
            raw: transaction.raw ? JSON.parse(transaction.raw) : null,
            status: transaction.status || 'PENDING',
            expense_id: transaction.expense_id
          }
        });
        console.log(`✅ Migrated bank transaction: ${transaction.description}`);
      } catch (error) {
        console.log(`❌ Failed to migrate bank transaction ${transaction.description}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    await prisma.$disconnect();
    sqliteDb.close();
  });
}

migrateData();
