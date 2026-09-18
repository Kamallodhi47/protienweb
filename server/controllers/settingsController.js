const { prisma, memoryDb } = require('../services/dbService');

const getSettings = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      settings: memoryDb.settings,
      bowlConfig: memoryDb.bowlConfig,
      subscriptionPlans: memoryDb.subscriptionPlans
    });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    memoryDb.settings = { ...memoryDb.settings, ...req.body };
    return res.json({
      success: true,
      message: 'Global settings saved successfully!',
      settings: memoryDb.settings
    });
  } catch (err) {
    next(err);
  }
};

// BOWL MANAGEMENT (FIXED BOWL RATE, TOTAL WEIGHT, MAX FRUITS LIMIT)
const getBowlConfig = async (req, res, next) => {
  try {
    return res.json({
      success: true,
      bowlConfig: {
        ...memoryDb.bowlConfig,
        bowlPrice: Number(memoryDb.bowlConfig.bowlPrice),
        totalBowlWeight: Number(memoryDb.bowlConfig.totalBowlWeight),
        maxFruitsAllowed: Number(memoryDb.bowlConfig.maxFruitsAllowed)
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateBowlConfig = async (req, res, next) => {
  try {
    const { bowlName, bowlPrice, totalBowlWeight, maxFruitsAllowed, description } = req.body;

    if (bowlPrice === undefined || totalBowlWeight === undefined || maxFruitsAllowed === undefined) {
      return res.status(400).json({ success: false, message: 'Bowl Price, Total Bowl Weight, and Max Fruits Limit are required.' });
    }

    memoryDb.bowlConfig = {
      bowlName: bowlName || memoryDb.bowlConfig.bowlName,
      bowlPrice: Number(bowlPrice),
      totalBowlWeight: Number(totalBowlWeight),
      maxFruitsAllowed: Number(maxFruitsAllowed),
      description: description || memoryDb.bowlConfig.description
    };

    console.log(`🥣 Live Bowl Config updated in Backend! Rate: ₹${memoryDb.bowlConfig.bowlPrice}, Weight: ${memoryDb.bowlConfig.totalBowlWeight}g, Max Fruits: ${memoryDb.bowlConfig.maxFruitsAllowed}`);

    return res.json({
      success: true,
      message: `Bowl configuration updated! Live Rate: ₹${memoryDb.bowlConfig.bowlPrice}`,
      bowlConfig: memoryDb.bowlConfig
    });
  } catch (err) {
    next(err);
  }
};

// SUBSCRIPTION PLANS CRUD DIRECT CONNECTED TO SQLITE dev.db
const getSubscriptionPlans = async (req, res, next) => {
  try {
    if (prisma) {
      const plans = await prisma.subscriptionPlan.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, count: plans.length, plans });
    }

    return res.json({ success: true, count: memoryDb.subscriptionPlans.length, plans: memoryDb.subscriptionPlans });
  } catch (err) {
    next(err);
  }
};

const createSubscriptionPlan = async (req, res, next) => {
  try {
    const { planName, category, price, perDayPrice, durationDays, bowlIncludes, juiceIncludes, description } = req.body;

    if (!planName || price === undefined) {
      return res.status(400).json({ success: false, message: 'Plan Name and Monthly Price are required.' });
    }

    if (prisma) {
      const createdPlan = await prisma.subscriptionPlan.create({
        data: {
          id: `plan-${Date.now()}`,
          planName,
          category: category || 'SALAD_AND_JUICE',
          price: Number(price),
          perDayPrice: Number(perDayPrice || Math.round(price / (durationDays || 30))),
          durationDays: Number(durationDays || 30),
          bowlIncludes: bowlIncludes || 'N/A',
          juiceIncludes: juiceIncludes || 'N/A',
          description: description || '',
          status: 'ACTIVE'
        }
      });

      console.log(`📅 Subscription Plan "${createdPlan.planName}" physically saved to SQLite dev.db file!`);

      memoryDb.subscriptionPlans.unshift(createdPlan);

      return res.status(201).json({
        success: true,
        message: 'Subscription plan created and saved to SQLite Database!',
        plan: createdPlan
      });
    }

    const newPlan = {
      id: `plan-${Date.now()}`,
      planName,
      category: category || 'SALAD_AND_JUICE',
      price: Number(price),
      perDayPrice: Number(perDayPrice || Math.round(price / (durationDays || 30))),
      durationDays: Number(durationDays || 30),
      bowlIncludes: bowlIncludes || 'N/A',
      juiceIncludes: juiceIncludes || 'N/A',
      description: description || '',
      status: 'ACTIVE',
      createdAt: new Date()
    };

    memoryDb.subscriptionPlans.unshift(newPlan);

    return res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully!',
      plan: newPlan
    });
  } catch (err) {
    next(err);
  }
};

const updateSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { planName, category, price, durationDays, bowlIncludes, juiceIncludes, description } = req.body;

    if (prisma) {
      const updatedPlan = await prisma.subscriptionPlan.update({
        where: { id },
        data: {
          planName: planName || undefined,
          category: category || undefined,
          price: price !== undefined ? Number(price) : undefined,
          durationDays: durationDays !== undefined ? Number(durationDays) : undefined,
          bowlIncludes: bowlIncludes || undefined,
          juiceIncludes: juiceIncludes || undefined,
          description: description || undefined
        }
      });

      console.log(`📅 Subscription Plan "${updatedPlan.planName}" updated in SQLite dev.db!`);

      const memoryIndex = memoryDb.subscriptionPlans.findIndex(p => p.id === id);
      if (memoryIndex !== -1) memoryDb.subscriptionPlans[memoryIndex] = updatedPlan;

      return res.json({
        success: true,
        message: 'Subscription plan updated in SQLite Database!',
        plan: updatedPlan
      });
    }

    const plan = memoryDb.subscriptionPlans.find(p => p.id === id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found.' });
    }

    Object.assign(plan, req.body);
    if (req.body.price) plan.price = Number(req.body.price);

    return res.json({
      success: true,
      message: 'Subscription plan updated successfully!',
      plan
    });
  } catch (err) {
    next(err);
  }
};

const deleteSubscriptionPlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const deletedPlan = await prisma.subscriptionPlan.delete({
        where: { id }
      });

      console.log(`📅 Subscription Plan "${deletedPlan.planName}" deleted from SQLite dev.db!`);

      const idx = memoryDb.subscriptionPlans.findIndex(p => p.id === id);
      if (idx !== -1) memoryDb.subscriptionPlans.splice(idx, 1);

      return res.json({
        success: true,
        message: 'Subscription plan deleted from SQLite Database!',
        plan: deletedPlan
      });
    }

    const idx = memoryDb.subscriptionPlans.findIndex(p => p.id === id);
    if (idx !== -1) {
      const removed = memoryDb.subscriptionPlans.splice(idx, 1);
      return res.json({ success: true, message: 'Subscription plan deleted successfully!', plan: removed[0] });
    }
    return res.status(404).json({ success: false, message: 'Plan not found.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getBowlConfig,
  updateBowlConfig,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
};
