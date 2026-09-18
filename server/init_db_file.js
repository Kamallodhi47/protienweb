const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, 'prisma');
const dbPath = path.join(prismaDir, 'dev.db');

if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

// Write SQLite Header magic string if file doesn't exist
if (!fs.existsSync(dbPath)) {
  const sqliteHeader = Buffer.from('SQLite format 3\0', 'binary');
  fs.writeFileSync(dbPath, sqliteHeader);
  console.log('✅ Created SQLite database file at:', dbPath);
} else {
  console.log('✅ SQLite database file exists at:', dbPath);
}
