require('dotenv').config({ path: '.env.local' });
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupDir = path.join(__dirname, 'backups');
const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

// Create backups directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

console.log('🔄 Starting database backup...');
console.log(`📁 Backup file: ${backupFile}`);

// Extract database URL components
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

// Use pg_dump if available, otherwise provide manual instructions
const command = `pg_dump "${dbUrl}" > "${backupFile}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ pg_dump not available. Manual backup instructions:');
    console.log('\n1. Go to your Neon dashboard: https://console.neon.tech');
    console.log('2. Select your database');
    console.log('3. Click "Backups" in the sidebar');
    console.log('4. Create a manual backup');
    console.log('\nOR install pg_dump:');
    console.log('  Windows: Download from https://www.postgresql.org/download/windows/');
    console.log('  Mac: brew install postgresql');
    console.log('  Linux: sudo apt-get install postgresql-client\n');
    return;
  }

  console.log('✅ Database backup completed successfully!');
  console.log(`📦 Backup saved to: ${backupFile}`);
  console.log(`💾 Size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
});
