const { prisma, memoryDb } = require('../services/dbService');

const getUpcomingMeals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    // Midnight today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (prisma) {
      const upcoming = await prisma.mealSchedule.findMany({
        where: {
          userId,
          delivery_date: { gte: startOfToday }
        },
        orderBy: { delivery_date: 'asc' }
      });
      return res.json({ success: true, count: upcoming.length, meals: upcoming });
    }

    const upcoming = (memoryDb.mealSchedules || [])
      .filter(m => m.userId === userId && new Date(m.delivery_date) >= startOfToday)
      .sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date));

    return res.json({ success: true, count: upcoming.length, meals: upcoming });
  } catch (err) {
    next(err);
  }
};

const getTomorrowMeal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const endOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 999);

    if (prisma) {
      const meal = await prisma.mealSchedule.findFirst({
        where: {
          userId,
          delivery_date: {
            gte: startOfTomorrow,
            lte: endOfTomorrow
          }
        },
        include: { customizations: true }
      });
      return res.json({ success: true, meal });
    }

    const meal = (memoryDb.mealSchedules || []).find(m => {
      const d = new Date(m.delivery_date);
      return m.userId === userId && d >= startOfTomorrow && d <= endOfTomorrow;
    });

    return res.json({ success: true, meal });
  } catch (err) {
    next(err);
  }
};

const customizeMeal = async (req, res, next) => {
  try {
    const { id } = req.params; // MealSchedule ID
    const { selected_meal, selected_addons, removed_items, special_instruction } = req.body;
    const userId = req.user.id;

    if (!selected_meal) {
      return res.status(400).json({ success: false, message: 'Meal selection is required.' });
    }

    let meal = null;
    if (prisma) {
      meal = await prisma.mealSchedule.findUnique({ where: { id } });
    } else {
      meal = (memoryDb.mealSchedules || []).find(m => m.id === id);
    }

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal schedule slot not found.' });
    }

    if (meal.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized customization attempt.' });
    }

    // Customization Cutoff Validation
    // Customization closes at 8:00 PM (20:00) of the previous day
    const deliveryDate = new Date(meal.delivery_date);
    const prevDayCutoff = new Date(deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate() - 1, 20, 0, 0, 0);

    const now = new Date();
    if (now > prevDayCutoff && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Customization window closed for this meal. The cutoff was 8:00 PM of the previous day.'
      });
    }

    // Save Customization
    if (prisma) {
      const customization = await prisma.mealCustomization.create({
        data: {
          id: `cust-${Date.now()}`,
          mealScheduleId: id,
          userId,
          selected_meal,
          selected_addons: selected_addons ? JSON.stringify(selected_addons) : null,
          removed_items: removed_items ? JSON.stringify(removed_items) : null,
          special_instruction
        }
      });

      await prisma.mealSchedule.update({
        where: { id },
        data: {
          customization_status: 'CUSTOMIZED',
          meal_name: selected_meal,
          special_instruction
        }
      });
    } else {
      const customization = {
        id: `cust-${Date.now()}`,
        mealScheduleId: id,
        userId,
        selected_meal,
        selected_addons: selected_addons ? JSON.stringify(selected_addons) : null,
        removed_items: removed_items ? JSON.stringify(removed_items) : null,
        special_instruction,
        submitted_at: new Date()
      };
      memoryDb.mealCustomizations = memoryDb.mealCustomizations || [];
      memoryDb.mealCustomizations.unshift(customization);

      meal.customization_status = 'CUSTOMIZED';
      meal.meal_name = selected_meal;
      meal.special_instruction = special_instruction;
    }

    return res.json({
      success: true,
      message: 'Meal customized successfully!'
    });
  } catch (err) {
    next(err);
  }
};

const getCalendarBySubscriptionId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (prisma) {
      const calendar = await prisma.mealSchedule.findMany({
        where: {
          subscriptionId: id,
          userId: req.user.role === 'ADMIN' ? undefined : userId
        },
        orderBy: { delivery_date: 'asc' }
      });
      return res.json({ success: true, calendar });
    }

    const calendar = (memoryDb.mealSchedules || [])
      .filter(m => m.subscriptionId === id && (req.user.role === 'ADMIN' || m.userId === userId))
      .sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date));

    return res.json({ success: true, calendar });
  } catch (err) {
    next(err);
  }
};

const getAllMealsAdmin = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    let filter = {};

    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 23, 59, 59, 999);
      filter.delivery_date = { gte: startOfDay, lte: endOfDay };
    }
    if (status) {
      filter.status = status;
    }

    if (prisma) {
      const meals = await prisma.mealSchedule.findMany({
        where: filter,
        include: {
          user: { select: { name: true, phone: true } },
          subscription: { include: { plan: true } }
        },
        orderBy: { delivery_date: 'asc' }
      });
      return res.json({ success: true, meals });
    }

    let meals = (memoryDb.mealSchedules || []);
    if (date) {
      const filterDateStr = new Date(date).toDateString();
      meals = meals.filter(m => new Date(m.delivery_date).toDateString() === filterDateStr);
    }
    if (status) {
      meals = meals.filter(m => m.status === status);
    }

    const enrichedMeals = meals.map(m => {
      const user = memoryDb.users.find(u => u.id === m.userId) || {};
      const subscription = memoryDb.subscriptions.find(s => s.id === m.subscriptionId) || {};
      const plan = memoryDb.subscriptionPlans.find(pl => pl.id === subscription.planId) || {};
      return {
        ...m,
        user: { name: user.name, phone: user.phone },
        subscription: { ...subscription, plan }
      };
    });

    return res.json({ success: true, meals: enrichedMeals });
  } catch (err) {
    next(err);
  }
};

const updateMealStatusAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // UPCOMING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, SKIPPED, CANCELLED

    if (prisma) {
      const updated = await prisma.mealSchedule.update({
        where: { id },
        data: { status }
      });
      return res.json({ success: true, meal: updated });
    }

    const meal = (memoryDb.mealSchedules || []).find(m => m.id === id);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal slot not found.' });
    }
    meal.status = status;
    meal.updated_at = new Date();

    return res.json({ success: true, meal });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUpcomingMeals,
  getTomorrowMeal,
  customizeMeal,
  getCalendarBySubscriptionId,
  getAllMealsAdmin,
  updateMealStatusAdmin
};
