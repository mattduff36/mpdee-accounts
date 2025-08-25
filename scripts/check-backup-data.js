const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Backup database path
const backupPath = path.join(__dirname, '../database-backup/mpdee-accounts-backup-2025-08-25T09-24-36.db');

// Create SQLite connection to backup
const backupDb = new sqlite3.Database(backupPath);

async function checkBackupData() {
  console.log('🔍 Checking backup database data...\n');
  
  try {
    // Check clients
    backupDb.all("SELECT * FROM clients", (err, clients) => {
      if (err) {
        console.error('❌ Error reading clients from backup:', err);
        return;
      }
      console.log(`📋 CLIENTS (${clients.length} total):`);
      clients.forEach(client => {
        console.log(`  - ${client.name} (${client.email})`);
      });
      
      // Check invoices
      backupDb.all("SELECT * FROM invoices", (err, invoices) => {
        if (err) {
          console.error('❌ Error reading invoices from backup:', err);
          return;
        }
        console.log(`\n📄 INVOICES (${invoices.length} total):`);
        invoices.forEach(invoice => {
          console.log(`  - ${invoice.invoice_number} - £${invoice.total_amount} (${invoice.status})`);
        });
        
        // Check invoice items
        backupDb.all("SELECT * FROM invoice_items", (err, items) => {
          if (err) {
            console.error('❌ Error reading invoice items from backup:', err);
            return;
          }
          console.log(`\n📝 INVOICE ITEMS (${items.length} total):`);
          items.forEach(item => {
            console.log(`  - ${item.description} - £${item.total}`);
          });
          
          // Check expenses
          backupDb.all("SELECT * FROM expenses", (err, expenses) => {
            if (err) {
              console.error('❌ Error reading expenses from backup:', err);
              return;
            }
            console.log(`\n💰 EXPENSES (${expenses.length} total):`);
            expenses.slice(0, 5).forEach(expense => {
              console.log(`  - ${expense.description} - £${expense.amount} (${expense.category})`);
            });
            if (expenses.length > 5) {
              console.log(`  ... and ${expenses.length - 5} more`);
            }
            
            console.log('\n✅ Backup database check completed!');
            backupDb.close();
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error checking backup:', error.message);
  }
}

checkBackupData();
