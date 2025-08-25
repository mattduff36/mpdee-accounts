const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Backup database path
const backupPath = path.join(__dirname, '../database-backup/mpdee-accounts-backup-2025-08-25T09-24-36.db');

// Create SQLite connection to backup
const backupDb = new sqlite3.Database(backupPath);

// Create Prisma client (will use DATABASE_URL from environment)
const prisma = new PrismaClient();

// Helper function to safely parse dates
function safeParseDate(dateString) {
  if (!dateString) return new Date();
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function migrateInvoicesFromBackup() {
  console.log('🔄 Migrating invoices from backup database...\n');
  
  try {
    // Test PostgreSQL connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Test backup connection
    backupDb.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
      if (err) {
        console.error('❌ Failed to connect to backup:', err);
        return;
      }
      console.log('✅ Connected to backup database');
    });
    
    // Migrate invoices
    console.log('\n📄 Migrating invoices...');
    backupDb.all("SELECT * FROM invoices", async (err, invoices) => {
      if (err) {
        console.error('❌ Error reading invoices from backup:', err);
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
              issue_date: invoice.issue_date ? safeParseDate(invoice.issue_date) : safeParseDate(invoice.created_at), // Use created_at as fallback
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
      migrateInvoiceItemsFromBackup();
    });
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
  }
}

async function migrateInvoiceItemsFromBackup() {
  console.log('\n📝 Migrating invoice items...');
  backupDb.all("SELECT * FROM invoice_items", async (err, items) => {
    if (err) {
      console.error('❌ Error reading invoice items from backup:', err);
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
            created_at: safeParseDate(item.created_at)
            // Removed updated_at as it doesn't exist in the Prisma schema
          }
        });
        console.log(`✅ Migrated invoice item: ${item.description}`);
      } catch (error) {
        console.log(`❌ Failed to migrate invoice item ${item.description}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Invoice migration completed!');
    await prisma.$disconnect();
    backupDb.close();
  });
}

migrateInvoicesFromBackup();
