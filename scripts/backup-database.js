const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../database-backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFileName = `mpdee-accounts-backup-${timestamp}.db`;
const backupPath = path.join(backupDir, backupFileName);

// Source database path
const sourcePath = path.join(__dirname, '../prisma/dev.db');

console.log('📦 Creating database backup...');
console.log(`Source: ${sourcePath}`);
console.log(`Backup: ${backupPath}`);

try {
  // Copy the database file
  fs.copyFileSync(sourcePath, backupPath);
  
  // Get file size
  const stats = fs.statSync(backupPath);
  const fileSizeInKB = Math.round(stats.size / 1024);
  
  console.log(`✅ Backup created successfully!`);
  console.log(`📁 File: ${backupFileName}`);
  console.log(`📊 Size: ${fileSizeInKB} KB`);
  console.log(`📅 Date: ${new Date().toLocaleString()}`);
  
  // Create backup info
  const infoContent = `MPDEE Accounts Database Backup
==============================

Backup Date: ${new Date().toLocaleString()}
Database File: ${backupFileName}
File Size: ${fileSizeInKB} KB

This backup contains all your local database data including:
- Clients
- Invoices
- Invoice Items
- Expenses
- Bank Imports
- Bank Transactions

To restore this backup:
1. Stop the development server
2. Copy this .db file to prisma/dev.db
3. Restart the development server
`;

  const infoPath = path.join(backupDir, 'backup-info.txt');
  fs.writeFileSync(infoPath, infoContent);
  
  console.log(`📝 Backup info updated: backup-info.txt`);
  
} catch (error) {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
}
