const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || '';
let provider = 'sqlite';

if (dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql')) {
  provider = 'postgresql';
}

// Find the datasource db block and replace the provider
schema = schema.replace(/datasource db\s*\{\s*provider\s*=\s*"[^"]+"/, `datasource db {\n  provider = "${provider}"`);

fs.writeFileSync(schemaPath, schema);
console.log(`✅ Dynamically set Prisma provider to ${provider} based on DATABASE_URL`);
