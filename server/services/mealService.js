const { prisma, memoryDb } = require('./dbService');

const leanMeals = [
  { name: "High Protein Paneer Bowl", protein: 42 },
  { name: "Quinoa Salad Bowl", protein: 38 },
  { name: "Detox Sprouts Salad", protein: 35 },
  { name: "Green Chickpea Protein Bowl", protein: 40 },
  { name: "Spiced Edamame Bowl", protein: 37 },
  { name: "Smoked Tofu Veggie Bowl", protein: 39 }
];

const beastMeals = [
  { name: "Double Protein Paneer & Sprouts Bowl", protein: 65 },
  { name: "Athlete Muscle Charger Bowl", protein: 60 },
  { name: "Super Sprouts Whey Boost Bowl", protein: 58 },
  { name: "Beast Paneer Tikka Bowl", protein: 70 },
  { name: "Ultra Protein Mix Bowl", protein: 62 },
  { name: "Titan Sprouts & Broccoli Bowl", protein: 64 }
];

const generateMealCalendar = async (subscription) => {
  try {
    const { id: subscriptionId, userId, start_date, planId, delivery_address, delivery_time } = subscription;
    const startDateObj = new Date(start_date);
    const durationDays = 30; // Monthly plan

    const mealsToCreate = [];
    const isBeast = planId === 'plan-beast';
    const mealsList = isBeast ? beastMeals : leanMeals;

    for (let i = 0; i < durationDays; i++) {
      const deliveryDate = new Date(startDateObj.getTime() + i * 24 * 60 * 60 * 1000);
      const mealConfig = mealsList[i % mealsList.length];

      mealsToCreate.push({
        id: `meal-${subscriptionId}-${i}-${Date.now().toString(36)}`,
        subscriptionId,
        userId,
        delivery_date: deliveryDate,
        meal_type: 'BOWL',
        meal_name: mealConfig.name,
        protein_grams: mealConfig.protein,
        quantity: 1,
        status: 'UPCOMING',
        delivery_time,
        address: delivery_address,
        customization_status: 'PENDING',
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    if (prisma) {
      // First clean up any existing upcoming meals for this subscription to avoid duplicates
      await prisma.mealSchedule.deleteMany({
        where: {
          subscriptionId,
          status: 'UPCOMING'
        }
      });

      await prisma.mealSchedule.createMany({
        data: mealsToCreate.map(m => ({
          id: m.id,
          subscriptionId: m.subscriptionId,
          userId: m.userId,
          delivery_date: m.delivery_date,
          meal_type: m.meal_type,
          meal_name: m.meal_name,
          protein_grams: m.protein_grams,
          quantity: m.quantity,
          status: m.status,
          delivery_time: m.delivery_time,
          address: m.address,
          customization_status: m.customization_status
        }))
      });
      console.log(`📅 Automatically generated 30-day meal calendar for Subscription ID: ${subscriptionId} in SQLite!`);
    } else {
      memoryDb.mealSchedules = memoryDb.mealSchedules || [];
      // Clean up duplicates
      memoryDb.mealSchedules = memoryDb.mealSchedules.filter(m => m.subscriptionId !== subscriptionId || m.status !== 'UPCOMING');
      memoryDb.mealSchedules.push(...mealsToCreate);
      console.log(`📅 Automatically generated 30-day meal calendar in memoryDb fallback!`);
    }
    return true;
  } catch (err) {
    console.error('Error generating meal calendar:', err.message);
    throw err;
  }
};

module.exports = {
  generateMealCalendar
};
