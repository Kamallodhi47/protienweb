const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPlans() {
  console.log('🌱 Seeding Monthly Subscription Plans into SQLite dev.db file...');

  const plans = [
    {
      id: 'plan-1',
      planName: '30-Day Lean Muscle Salad & Juice Combo',
      category: 'SALAD_AND_JUICE',
      price: 4999,
      perDayPrice: 166,
      durationDays: 30,
      bowlIncludes: 'Custom 4-Fruit High Protein Salad Bowl',
      juiceIncludes: '1 Cold-Pressed Juice Shot (Carrot / Beetroot)',
      description: 'Daily fresh weighed fruit salad bowl + 1 immunity juice shot delivered every morning.',
      status: 'ACTIVE'
    },
    {
      id: 'plan-2',
      planName: '30-Day Athlete Beast Protein Package',
      category: 'SALAD_AND_JUICE',
      price: 6999,
      perDayPrice: 233,
      durationDays: 30,
      bowlIncludes: 'Double Protein Paneer & Sprouts Salad Bowl',
      juiceIncludes: '1 Wheatgrass / Aloe Vera Juice Shot + Smoothie',
      description: 'High protein athlete meal plan with 40g+ protein daily and cold-pressed detox juices.',
      status: 'ACTIVE'
    },
    {
      id: 'plan-3',
      planName: '30-Day Pure Organic Juice Detox Plan',
      category: 'JUICE_ONLY',
      price: 2499,
      perDayPrice: 83,
      durationDays: 30,
      bowlIncludes: 'N/A',
      juiceIncludes: 'Daily 2x Cold-Pressed Detox Juices (Amla / Ginger Lemon)',
      description: 'Monthly cellular detox juice plan for immunity and digestive wellness.',
      status: 'ACTIVE'
    }
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
  }

  console.log('✅ Subscription Plans physically seeded in SQLite dev.db file!');
}

seedPlans().catch(console.error).finally(() => prisma.$disconnect());
