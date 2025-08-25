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

async function migrateInvoiceItemsFromBackup() {
  console.log('🔄 Migrating invoice items from backup database...\n');
  
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
    
    // Migrate invoice items
    console.log('\n📝 Migrating invoice items...');
    backupDb.all("SELECT * FROM invoice_items", async (err, items) => {
      if (err) {
        console.error('❌ Error reading invoice items from backup:', err);
        return;
      }
      
      console.log(`Found ${items.length} invoice items to migrate`);
      
      for (const item of items) {
        try {
          // Use raw SQL to insert invoice items with correct field names
          const insertQuery = `
            INSERT INTO "public"."invoice_items" (
              "id", "invoice_id", "description", "quantity", "unit_price", 
              "total_price", "created_at", "updated_at", "rate", "total", 
              "agency_commission", "business_area"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::"public"."BusinessArea"
            )
          `;
          
          await prisma.$executeRawUnsafe(insertQuery,
            item.id,
            item.invoice_id,
            item.description,
            parseInt(item.quantity),
            parseFloat(item.rate), // unit_price
            parseFloat(item.total), // total_price
            safeParseDate(item.created_at),
            safeParseDate(item.updated_at),
            parseFloat(item.rate), // rate (duplicate for compatibility)
            parseFloat(item.total), // total (duplicate for compatibility)
            parseFloat(item.agency_commission || 0),
            item.business_area || 'CREATIVE'
          );
          
          console.log(`✅ Migrated invoice item: ${item.description}`);
        } catch (error) {
          console.log(`❌ Failed to migrate invoice item ${item.description}: ${error.message}`);
        }
      }
      
      console.log('\n🎉 Invoice items migration completed!');
      await prisma.$disconnect();
      backupDb.close();
    });
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
  }
}

migrateInvoiceItemsFromBackup();
