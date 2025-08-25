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
    
    // Migrate invoices using raw SQL to include all fields
    console.log('\n📄 Migrating invoices...');
    backupDb.all("SELECT * FROM invoices", async (err, invoices) => {
      if (err) {
        console.error('❌ Error reading invoices from backup:', err);
        return;
      }
      
      console.log(`Found ${invoices.length} invoices to migrate`);
      
      for (const invoice of invoices) {
        try {
          // Use raw SQL to insert with all required fields
          const insertQuery = `
            INSERT INTO "public"."invoices" (
              "id", "invoice_number", "client_id", "issue_date", "due_date", 
              "total_amount", "status", "notes", "created_at", "updated_at", 
              "sent_date", "paid_date"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            )
          `;
          
          await prisma.$executeRawUnsafe(insertQuery,
            invoice.id,
            invoice.invoice_number,
            invoice.client_id,
            invoice.issue_date ? safeParseDate(invoice.issue_date) : safeParseDate(invoice.created_at),
            invoice.due_date ? safeParseDate(invoice.due_date) : null,
            parseFloat(invoice.total_amount),
            invoice.status,
            invoice.notes || null,
            safeParseDate(invoice.created_at),
            safeParseDate(invoice.updated_at),
            invoice.sent_date ? safeParseDate(invoice.sent_date) : null,
            invoice.paid_date ? safeParseDate(invoice.paid_date) : null
          );
          
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
        // Use raw SQL to insert invoice items
        const insertQuery = `
          INSERT INTO "public"."invoice_items" (
            "id", "invoice_id", "description", "quantity", "rate", 
            "total", "agency_commission", "business_area", "created_at"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
        `;
        
        await prisma.$executeRawUnsafe(insertQuery,
          item.id,
          item.invoice_id,
          item.description,
          parseFloat(item.quantity),
          parseFloat(item.rate),
          parseFloat(item.total),
          parseFloat(item.agency_commission || 0),
          item.business_area || 'CREATIVE',
          safeParseDate(item.created_at)
        );
        
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
