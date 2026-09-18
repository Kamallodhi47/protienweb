const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
  console.log('🔍 Checking physical Order records in SQLite dev.db file...');
  const orders = await prisma.order.findMany({ include: { items: true } });
  console.log(`📦 Total Orders saved in SQLite dev.db (${orders.length}):`);
  orders.forEach(o => {
    console.log(`  - Order ${o.orderNumber}: Amount ₹${o.totalAmount}, Status: ${o.status}, UserID: ${o.userId}, Items: ${o.items.map(i => i.name).join(', ')}`);
  });
}

checkOrders().catch(console.error).finally(() => prisma.$disconnect());
