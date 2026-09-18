const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('🔍 Checking SQLite dev.db physical content...');
  const users = await prisma.user.findMany();
  console.log(`👤 Users in dev.db (${users.length}):`, users.map(u => ({ id: u.id, email: u.email, role: u.role })));

  const ingredients = await prisma.ingredient.findMany();
  console.log(`🍎 Ingredients in dev.db (${ingredients.length}):`, ingredients.map(i => i.name));

  const juices = await prisma.juice.findMany();
  console.log(`🧃 Juices in dev.db (${juices.length}):`, juices.map(j => j.name));
}

check().catch(console.error).finally(() => prisma.$disconnect());
