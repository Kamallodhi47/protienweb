const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populating SQLite dev.db file directly via Prisma Client...');
  const DEFAULT_HASH = bcrypt.hashSync('admin123', 10);

  // 1. Seed Users
  const users = [
    {
      id: 'usr-admin-1',
      name: 'Admin Master',
      email: 'admin@protein.com',
      password: DEFAULT_HASH,
      phone: '+91 98765 43210',
      role: 'ADMIN',
      dailyProteinGoal: 150
    },
    {
      id: 'usr-customer-1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: DEFAULT_HASH,
      phone: '+91 91234 56789',
      role: 'CUSTOMER',
      dailyProteinGoal: 120
    }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u
    });
  }
  console.log('✅ Users inserted into SQLite dev.db User table!');

  // 2. Seed Ingredients (Fruits)
  const ingredients = [
    {
      id: 'ing-1',
      name: 'Fresh Organic Apple',
      category: 'FRUITS',
      specification: 'Grade A Shimla Red Delicious',
      description: 'Crisp, naturally sweet organic apples packed with fiber and vitamin C.',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
      price: 40,
      weight: 100,
      protein: 0.5,
      calories: 52,
      carbs: 14,
      fat: 0.2,
      stock: 150,
      status: 'AVAILABLE'
    },
    {
      id: 'ing-2',
      name: 'Robusta Banana',
      category: 'FRUITS',
      specification: 'Potassium-Rich Energy Fruit',
      description: 'Rich in quick-acting electrolytes and natural fruit sugars.',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
      price: 30,
      weight: 100,
      protein: 1.3,
      calories: 89,
      carbs: 23,
      fat: 0.3,
      stock: 200,
      status: 'AVAILABLE'
    },
    {
      id: 'ing-3',
      name: 'Alphonso Mango Slices',
      category: 'FRUITS',
      specification: 'Ratnagiri Pure Mango',
      description: 'Premium sweet mango chunks rich in Vitamin A.',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078',
      price: 60,
      weight: 100,
      protein: 0.8,
      calories: 60,
      carbs: 15,
      fat: 0.4,
      stock: 80,
      status: 'AVAILABLE'
    },
    {
      id: 'ing-4',
      name: 'Honey Papaya Cubes',
      category: 'FRUITS',
      specification: 'Digestive Enzyme Rich',
      description: 'Contains natural papain enzymes aiding rapid protein absorption.',
      image: 'https://images.unsplash.com/photo-1517260739337-6799d239ce83',
      price: 35,
      weight: 100,
      protein: 0.5,
      calories: 43,
      carbs: 11,
      fat: 0.3,
      stock: 120,
      status: 'AVAILABLE'
    },
    {
      id: 'ing-5',
      name: 'Green Kiwi Slices',
      category: 'FRUITS',
      specification: 'High Vitamin C Superfruit',
      description: 'Tangy fresh kiwi packed with immunity nutrients.',
      image: 'https://images.unsplash.com/photo-1585059819970-07f71438fe3b',
      price: 50,
      weight: 100,
      protein: 1.1,
      calories: 61,
      carbs: 15,
      fat: 0.5,
      stock: 90,
      status: 'AVAILABLE'
    },
    {
      id: 'ing-6',
      name: 'Wild Strawberry Chunks',
      category: 'FRUITS',
      specification: 'Antioxidant Berry',
      description: 'Low calorie berry boost providing rich flavonoids.',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6',
      price: 70,
      weight: 100,
      protein: 0.7,
      calories: 32,
      carbs: 7.7,
      fat: 0.3,
      stock: 110,
      status: 'AVAILABLE'
    },
    {
      id: 'ing-7',
      name: 'Fresh Pomegranate Seeds',
      category: 'FRUITS',
      specification: 'Nitric Oxide & Iron Booster',
      description: 'Ruby red arils loaded with punicalagins for healthy blood circulation.',
      image: 'https://images.unsplash.com/photo-1541345023926-55d6e0853f4b',
      price: 65,
      weight: 100,
      protein: 1.7,
      calories: 83,
      carbs: 19,
      fat: 1.2,
      stock: 95,
      status: 'AVAILABLE'
    }
  ];

  for (const ing of ingredients) {
    await prisma.ingredient.upsert({
      where: { id: ing.id },
      update: ing,
      create: ing
    });
  }
  console.log('✅ Ingredients inserted into SQLite dev.db Ingredient table!');

  // 3. Seed Juices
  const juices = [
    {
      id: 'juc-1',
      name: 'Fresh Carrot Detox Juice',
      ingredients: 'Organic Carrots, Ginger, Lemon, Green Apple',
      specification: 'Cold-Pressed Vitamin A Boost',
      description: 'Cold-pressed organic carrots packed with Vitamin A and Beta-Carotene.',
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423',
      price: 99,
      protein: 1.5,
      calories: 95,
      carbs: 22,
      fat: 0.3,
      stock: 50,
      status: 'AVAILABLE'
    },
    {
      id: 'juc-2',
      name: 'Beetroot Stamina Booster',
      ingredients: 'Beetroot, Pomegranate, Pink Salt, Mint',
      specification: 'Pre-Workout Stamina Juice',
      description: 'Enhances blood oxygenation and nitric oxide levels.',
      image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38',
      price: 109,
      protein: 2.1,
      calories: 110,
      carbs: 25,
      fat: 0.4,
      stock: 40,
      status: 'AVAILABLE'
    },
    {
      id: 'juc-3',
      name: 'Wild Amla Immunity Shot',
      ingredients: '100% Raw Indian Gooseberry, Black Salt',
      specification: 'Vitamin C Immunity Shot (60ml)',
      description: 'Concentrated natural Vitamin C powerhouse shot.',
      image: 'https://images.unsplash.com/photo-1546173159-315724a31696',
      price: 49,
      protein: 0.8,
      calories: 35,
      carbs: 8,
      fat: 0.1,
      stock: 100,
      status: 'AVAILABLE'
    },
    {
      id: 'juc-4',
      name: 'Pure Aloe Vera Hydration',
      ingredients: 'Aloe Vera Pulp, Coconut Water, Lemon',
      specification: 'Digestive & Skin Hydration',
      description: 'Soothes gastrointestinal lining and provides electrolytes.',
      image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5',
      price: 79,
      protein: 0.4,
      calories: 25,
      carbs: 6,
      fat: 0.0,
      stock: 60,
      status: 'AVAILABLE'
    }
  ];

  for (const j of juices) {
    await prisma.juice.upsert({
      where: { id: j.id },
      update: j,
      create: j
    });
  }
  console.log('✅ Juices inserted into SQLite dev.db Juice table!');

  // 4. Seed SubscriptionPlans
  const subPlans = [
    {
      id: 'plan-lean',
      name: 'Lean Muscle Plan',
      slug: 'lean-muscle-plan',
      description: 'Daily Weighed High-Protein Bowl, 1 Cold-Pressed Juice or Immunity Shot, Free Express 30-Min Delivery, Pause / Resume Plan Anytime, Customize Tomorrow\'s Meal from Dashboard',
      target_protein: '35g - 45g',
      monthly_price: 4999,
      billing_cycle: 'MONTHLY',
      badge: 'MOST POPULAR',
      is_active: true
    },
    {
      id: 'plan-beast',
      name: 'Athlete Beast Package',
      slug: 'athlete-beast-package',
      description: 'Double Protein Paneer & Sprouts Bowl, 1 Post-Workout Whey Isolate Smoothie, 1 Daily Immunity Booster Juice, Priority Express Delivery, Dedicated Nutritionist Guidance',
      target_protein: '55g - 70g',
      monthly_price: 6999,
      billing_cycle: 'MONTHLY',
      badge: 'MOST POPULAR',
      is_active: true
    }
  ];

  for (const plan of subPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan
    });
  }
  console.log('✅ SubscriptionPlans inserted into SQLite dev.db!');

  console.log('🎉 ALL TABLES IN SQLITE dev.db POPULATED SUCCESSFULLY!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
