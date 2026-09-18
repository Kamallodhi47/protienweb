/**
 * Database Service & Prisma Client Wrapper
 * Handles live SQLite database connection via Prisma ORM (`dev.db`)
 */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
let prisma = null;

try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
  console.log('🐘 Prisma Client initialized with SQLite database (dev.db)!');
} catch (e) {
  console.log('⚠️ Prisma Client fallback mode active:', e.message);
}

const DEFAULT_HASH = bcrypt.hashSync('admin123', 10);

// In-Memory Database Fallback Store
const memoryDb = {
  users: [
    {
      id: 'usr-admin-1',
      name: 'Admin Master',
      email: 'admin@protein.com',
      password: DEFAULT_HASH,
      phone: '+91 98765 43210',
      role: 'ADMIN',
      dailyProteinGoal: 150,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01')
    },
    {
      id: 'usr-customer-1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: DEFAULT_HASH,
      phone: '+91 91234 56789',
      role: 'CUSTOMER',
      dailyProteinGoal: 120,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10')
    }
  ],
  addresses: [
    {
      id: 'addr-1',
      userId: 'usr-customer-1',
      street: '42 Fitness Avenue, Suite 101',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      isDefault: true,
      createdAt: new Date('2026-01-10')
    }
  ],

  // BOWL CONFIGURATION
  bowlConfig: {
    bowlName: 'Custom High-Protein Fruit Salad Bowl',
    bowlPrice: 99,
    totalBowlWeight: 350,
    maxFruitsAllowed: 4,
    description: 'Select up to 4 fresh organic fruits per bowl.'
  },

  // SUBSCRIPTION PLANS
  subscriptionPlans: [
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
    }
  ],

  // FRUITS & INGREDIENTS
  ingredients: [
    {
      id: 'ing-1',
      name: 'Fresh Organic Apple',
      category: 'FRUITS',
      specification: 'Grade A Shimla Red Delicious',
      description: 'Crisp, naturally sweet organic apples packed with fiber and vitamin C.',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
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
      description: 'Rich in quick-acting electrolytes and natural fruit sugars for instant workout power.',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
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
      description: 'Premium sweet mango chunks rich in Vitamin A and antioxidant polyphenols.',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078',
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
      description: 'Tangy fresh kiwi packed with immunity nutrients and actinidin enzyme.',
      image: 'https://images.unsplash.com/photo-1585059819970-07f71438fe3b',
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
      description: 'Low calorie berry boost providing rich flavonoids and vibrant flavor.',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6',
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
      protein: 1.7,
      calories: 83,
      carbs: 19,
      fat: 1.2,
      stock: 95,
      status: 'AVAILABLE'
    },
    {
      id: 'ing-8',
      name: 'Fresh Lemon Squeeze (Nimbu)',
      category: 'SEASONINGS',
      specification: 'Tangy Vitamin C Squeeze',
      description: 'Fresh organic lemon juice squeeze adding zest and Vitamin C.',
      image: 'https://images.unsplash.com/photo-1534531141161-e41d1341d1de?w=200',
      protein: 0.1,
      calories: 5,
      carbs: 1.2,
      fat: 0.0,
      stock: 300,
      status: 'AVAILABLE'
    },
    {
      id: 'ing-9',
      name: 'Special Chaat Masala',
      category: 'SEASONINGS',
      specification: 'Digestive Indian Spice Mix',
      description: 'Zesty digestive chaat spice mix for mouth-watering flavor.',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200',
      protein: 0.0,
      calories: 5,
      carbs: 1.0,
      fat: 0.0,
      stock: 300,
      status: 'AVAILABLE'
    },
    {
      id: 'ing-10',
      name: 'Fresh Mint Leaves (Pudina)',
      category: 'SEASONINGS',
      specification: 'Cooling Digestive Herbs',
      description: 'Fresh fragrant pudina leaves enhancing digestion and freshness.',
      image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=200',
      protein: 0.2,
      calories: 4,
      carbs: 0.8,
      fat: 0.0,
      stock: 250,
      status: 'AVAILABLE'
    }
  ],

  // JUICES
  juices: [
    {
      id: 'juc-1',
      name: 'Fresh Carrot Detox Juice',
      ingredients: 'Organic Carrots, Ginger, Lemon, Green Apple',
      specification: 'Cold-Pressed Vitamin A & Beta-Carotene Boost',
      description: 'Cold-pressed organic carrots packed with Vitamin A, Beta-Carotene, and digestive enzymes.',
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
      ingredients: 'Beetroot, Pomegranate, Himalayan Pink Salt, Mint',
      specification: 'Nitric Oxide Pre-Workout Stamina Juice',
      description: 'Enhances blood oxygenation and nitric oxide levels for peak athletic endurance.',
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
      specification: 'Pure Vitamin C Immunity Shot (60ml)',
      description: 'Concentrated natural Vitamin C powerhouse shot strengthening immunity and digestion.',
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
      ingredients: 'Fresh Aloe Vera Pulp, Coconut Water, Lemon',
      specification: 'Alkalizing Digestive & Skin Hydration',
      description: 'Soothes gastrointestinal lining and provides essential natural electrolytes.',
      image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5',
      price: 79,
      protein: 0.4,
      calories: 25,
      carbs: 6,
      fat: 0.0,
      stock: 60,
      status: 'AVAILABLE'
    }
  ],

  products: [],
  orders: [],
  subscriptions: [],
  inventoryLogs: [],
  cms: {},
  sproutsProteinCategories: [
    { id: 'spc-1', name: 'Step 1: Sprouts', slug: 'sprouts', description: 'Freshly sprouted beans and legumes', displayOrder: 1, isActive: true },
    { id: 'spc-2', name: 'Step 2: Protein', slug: 'protein', description: 'Lean muscle building ingredients', displayOrder: 2, isActive: true },
    { id: 'spc-3', name: 'Step 3: Vegetables', slug: 'vegetables', description: 'Crispy high-fiber veggies', displayOrder: 3, isActive: true },
    { id: 'spc-4', name: 'Step 4: Healthy Toppings', slug: 'toppings', description: 'Delicious fitness toppings', displayOrder: 4, isActive: true },
    { id: 'spc-5', name: 'Step 5: Seeds & Power Foods', slug: 'seeds', description: 'Micro-nutrient rich superfoods', displayOrder: 5, isActive: true },
    { id: 'spc-6', name: 'Step 6: Taste & Dressing', slug: 'seasonings', description: 'Fresh Lemon (Nimbu), Special Masala & Pudina', displayOrder: 6, isActive: true }
  ],
  sproutsProteinIngredients: [
    {
      id: 'spi-1',
      categoryId: 'spc-1',
      name: 'Organic Moong Sprouts',
      slug: 'moong-sprouts',
      description: 'Rich in dietary fiber and essential minerals.',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      portionSize: '50g',
      unit: 'g',
      price: 25,
      protein: 3.5,
      calories: 45,
      carbohydrates: 8.0,
      healthyFat: 0.3,
      fiber: 2.0,
      weight: 50,
      displayOrder: 1,
      isActive: true,
      isFeatured: true
    },
    {
      id: 'spi-2',
      categoryId: 'spc-1',
      name: 'Kala Chana Sprouts',
      slug: 'kala-chana-sprouts',
      description: 'Iron rich black chickpea sprouts.',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      portionSize: '50g',
      unit: 'g',
      price: 20,
      protein: 4.5,
      calories: 60,
      carbohydrates: 10.0,
      healthyFat: 0.5,
      fiber: 3.0,
      weight: 50,
      displayOrder: 2,
      isActive: true,
      isFeatured: false
    },
    {
      id: 'spi-3',
      categoryId: 'spc-2',
      name: 'Fresh Tofu Cubes',
      slug: 'fresh-tofu',
      description: 'High-quality organic plant-based soy protein.',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      portionSize: '100g',
      unit: 'g',
      price: 35,
      protein: 8.0,
      calories: 76,
      carbohydrates: 1.9,
      healthyFat: 4.8,
      fiber: 0.3,
      weight: 100,
      displayOrder: 3,
      isActive: true,
      isFeatured: true
    },
    {
      id: 'spi-4',
      categoryId: 'spc-2',
      name: 'Low Fat Paneer',
      slug: 'low-fat-paneer',
      description: 'Delicious soft low-fat cottage cheese cubes.',
      image: 'https://images.unsplash.com/photo-1601050690597-df056fb49785?w=400',
      portionSize: '100g',
      unit: 'g',
      price: 45,
      protein: 18.0,
      calories: 140,
      carbohydrates: 3.0,
      healthyFat: 6.0,
      fiber: 0.0,
      weight: 100,
      displayOrder: 4,
      isActive: true,
      isFeatured: true
    },
    {
      id: 'spi-5',
      categoryId: 'spc-3',
      name: 'Crispy Broccoli Florets',
      slug: 'crispy-broccoli',
      description: 'High in Vitamin C, K and folic acid.',
      image: 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9bc?w=400',
      portionSize: '80g',
      unit: 'g',
      price: 30,
      protein: 2.3,
      calories: 27,
      carbohydrates: 5.6,
      healthyFat: 0.3,
      fiber: 2.1,
      weight: 80,
      displayOrder: 5,
      isActive: true,
      isFeatured: false
    },
    {
      id: 'spi-6',
      categoryId: 'spc-4',
      name: 'Sweet Organic Corn',
      slug: 'sweet-corn',
      description: 'Juicy steamed sweet corn kernels.',
      image: 'https://images.unsplash.com/photo-1551754655-cd27e38d20f6?w=400',
      portionSize: '50g',
      unit: 'g',
      price: 15,
      protein: 1.6,
      calories: 43,
      carbohydrates: 9.5,
      healthyFat: 0.6,
      fiber: 1.3,
      weight: 50,
      displayOrder: 6,
      isActive: true,
      isFeatured: false
    },
    {
      id: 'spi-7',
      categoryId: 'spc-5',
      name: 'Raw Chia Seeds',
      slug: 'raw-chia-seeds',
      description: 'Loaded with Omega-3 and rich antioxidants.',
      image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400',
      portionSize: '15g',
      unit: 'g',
      price: 25,
      protein: 2.5,
      calories: 73,
      carbohydrates: 6.3,
      healthyFat: 4.6,
      fiber: 5.1,
      weight: 15,
      displayOrder: 7,
      isActive: true,
      isFeatured: true
    },
    {
      id: 'spi-8',
      categoryId: 'spc-6',
      name: 'Fresh Lemon Squeeze (Nimbu)',
      slug: 'fresh-lemon-squeeze-nimbu',
      description: 'Zesty fresh organic lemon squeeze packed with Vitamin C.',
      image: 'https://images.unsplash.com/photo-1534531141161-e41d1341d1de?w=400',
      portionSize: '1 Squeeze',
      unit: 'g',
      price: 5,
      protein: 0.1,
      calories: 5,
      carbohydrates: 1.2,
      healthyFat: 0.0,
      fiber: 0.2,
      weight: 10,
      displayOrder: 1,
      isActive: true,
      isFeatured: true
    },
    {
      id: 'spi-9',
      categoryId: 'spc-6',
      name: 'Special Protein Masala',
      slug: 'special-protein-masala',
      description: 'Aromatic digestive spice mix crafted for sprouts and paneer.',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
      portionSize: '1 Pinch',
      unit: 'g',
      price: 5,
      protein: 0.0,
      calories: 5,
      carbohydrates: 1.0,
      healthyFat: 0.0,
      fiber: 0.1,
      weight: 5,
      displayOrder: 2,
      isActive: true,
      isFeatured: true
    },
    {
      id: 'spi-10',
      categoryId: 'spc-6',
      name: 'Fresh Pudina Chutney / Leaves',
      slug: 'fresh-pudina-leaves',
      description: 'Cooling green mint leaves providing antioxidant freshness.',
      image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400',
      portionSize: '1 Portion',
      unit: 'g',
      price: 5,
      protein: 0.2,
      calories: 8,
      carbohydrates: 1.5,
      healthyFat: 0.1,
      fiber: 0.5,
      weight: 15,
      displayOrder: 3,
      isActive: true,
      isFeatured: true
    }
  ],
  settings: {
    deliveryCharge: '30',
    gstPercentage: '5',
    storeOpeningTime: '08:00 AM',
    storeClosingTime: '10:00 PM',
    whatsappSupport: '+91 98765 43210',
    supportEmail: 'support@proteinproject.com'
  }
};

// Seed SQLite database table records if live Prisma is active
const initLiveDatabase = async () => {
  if (!prisma) return;
  try {
    const seedMarker = path.join(__dirname, '..', 'prisma', '.db_seeded');
    const isAlreadySeeded = fs.existsSync(seedMarker);

    const userCount = await prisma.user.count();
    if (userCount === 0 && !isAlreadySeeded) {
      console.log('🌱 Seeding SQLite database dev.db via Prisma ORM...');
      await prisma.user.createMany({
        data: memoryDb.users
      });
      console.log('✅ Users seeded into dev.db!');
    } else {
      memoryDb.users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    }

    const ingCount = await prisma.ingredient.count();
    if (ingCount === 0 && !isAlreadySeeded) {
      await prisma.ingredient.createMany({
        data: memoryDb.ingredients
      });
      console.log('✅ Ingredients seeded into dev.db!');
    } else {
      memoryDb.ingredients = await prisma.ingredient.findMany({ orderBy: { createdAt: 'desc' } });
    }

    const jcCount = await prisma.juice.count();
    if (jcCount === 0 && !isAlreadySeeded) {
      await prisma.juice.createMany({
        data: memoryDb.juices
      });
      console.log('✅ Juices seeded into dev.db!');
    } else {
      memoryDb.juices = await prisma.juice.findMany({ orderBy: { createdAt: 'desc' } });
    }

    const prodCount = await prisma.product.count();
    if (prodCount > 0) {
      memoryDb.products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    }
    
    // Seed sprouts categories
    const spcCount = await prisma.sproutsProteinCategory.count();
    if (spcCount === 0 && !isAlreadySeeded) {
      await prisma.sproutsProteinCategory.createMany({
        data: memoryDb.sproutsProteinCategories
      });
      console.log('✅ Sprouts categories seeded into dev.db!');
    } else {
      memoryDb.sproutsProteinCategories = await prisma.sproutsProteinCategory.findMany({ orderBy: { displayOrder: 'asc' } });
    }

    // Seed sprouts ingredients
    const spiCount = await prisma.sproutsProteinIngredient.count();
    if (spiCount === 0 && !isAlreadySeeded) {
      await prisma.sproutsProteinIngredient.createMany({
        data: memoryDb.sproutsProteinIngredients
      });
      console.log('✅ Sprouts ingredients seeded into dev.db!');
    } else {
      memoryDb.sproutsProteinIngredients = await prisma.sproutsProteinIngredient.findMany({ orderBy: { displayOrder: 'asc' }, include: { category: true } });
    }

    if (!isAlreadySeeded) {
      fs.writeFileSync(seedMarker, new Date().toISOString(), 'utf-8');
      console.log('📌 Seed marker saved to prisma/.db_seeded');
    }
  } catch (err) {
    console.log('Live DB sync status:', err.message);
  }
};

initLiveDatabase();

module.exports = {
  prisma,
  memoryDb
};
