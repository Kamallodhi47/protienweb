const { prisma, memoryDb } = require('../services/dbService');
const { generateMealCalendar } = require('../services/mealService');

// PLANS CRUD
const getSubscriptionPlans = async (req, res, next) => {
  try {
    if (prisma) {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { is_active: true }
      });
      return res.json({ success: true, plans });
    }
    return res.json({ success: true, plans: memoryDb.subscriptionPlans.filter(p => p.status === 'ACTIVE') });
  } catch (err) {
    next(err);
  }
};

const createSubscriptionPlanAdmin = async (req, res, next) => {
  try {
    const { name, slug, description, target_protein, monthly_price, badge, billing_cycle } = req.body;
    if (!name || !slug || !monthly_price) {
      return res.status(400).json({ success: false, message: 'Name, Slug, and Price are required.' });
    }

    if (prisma) {
      const newPlan = await prisma.subscriptionPlan.create({
        data: {
          name,
          slug,
          description,
          target_protein,
          monthly_price: Number(monthly_price),
          badge,
          billing_cycle: billing_cycle || 'MONTHLY',
          is_active: true
        }
      });
      return res.status(201).json({ success: true, plan: newPlan });
    }

    const newPlan = {
      id: `plan-${Date.now()}`,
      name,
      slug,
      description,
      target_protein,
      monthly_price: Number(monthly_price),
      badge,
      billing_cycle: billing_cycle || 'MONTHLY',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryDb.subscriptionPlans.push(newPlan);
    return res.status(201).json({ success: true, plan: newPlan });
  } catch (err) {
    next(err);
  }
};

const updateSubscriptionPlanAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, target_protein, monthly_price, badge, is_active } = req.body;

    if (prisma) {
      const updated = await prisma.subscriptionPlan.update({
        where: { id },
        data: {
          name,
          description,
          target_protein,
          monthly_price: monthly_price ? Number(monthly_price) : undefined,
          badge,
          is_active
        }
      });
      return res.json({ success: true, plan: updated });
    }

    const plan = memoryDb.subscriptionPlans.find(p => p.id === id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

    if (name) plan.name = name;
    if (description) plan.description = description;
    if (target_protein) plan.target_protein = target_protein;
    if (monthly_price) plan.monthly_price = Number(monthly_price);
    if (badge) plan.badge = badge;
    if (is_active !== undefined) plan.is_active = is_active;
    plan.updated_at = new Date();

    return res.json({ success: true, plan });
  } catch (err) {
    next(err);
  }
};

const deleteSubscriptionPlanAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (prisma) {
      await prisma.subscriptionPlan.update({
        where: { id },
        data: { is_active: false }
      });
    } else {
      const plan = memoryDb.subscriptionPlans.find(p => p.id === id);
      if (plan) plan.status = 'INACTIVE';
    }
    return res.json({ success: true, message: 'Plan deactivated successfully.' });
  } catch (err) {
    next(err);
  }
};

// SUBSCRIPTIONS CONTROLLERS
const getCustomerSubscriptions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (prisma) {
      const subs = await prisma.subscription.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { created_at: 'desc' }
      });
      return res.json({ success: true, subscriptions: subs });
    }

    const subs = (memoryDb.subscriptions || [])
      .filter(s => s.userId === userId)
      .map(s => {
        const plan = memoryDb.subscriptionPlans.find(p => p.id === s.planId) || {};
        return { ...s, plan };
      });

    return res.json({ success: true, subscriptions: subs });
  } catch (err) {
    next(err);
  }
};

const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (prisma) {
      const sub = await prisma.subscription.findUnique({
        where: { id },
        include: { plan: true }
      });

      if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });
      if (sub.userId !== userId && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      return res.json({ success: true, subscription: sub });
    }

    const sub = (memoryDb.subscriptions || []).find(s => s.id === id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });
    if (sub.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const plan = memoryDb.subscriptionPlans.find(p => p.id === sub.planId) || {};
    return res.json({ success: true, subscription: { ...sub, plan } });
  } catch (err) {
    next(err);
  }
};

const createSubscription = async (req, res, next) => {
  try {
    const { planId, deliveryAddress, deliveryTime, start_date } = req.body;
    const userId = req.user.id;

    if (!planId || !deliveryAddress || !deliveryTime) {
      return res.status(400).json({ success: false, message: 'Required fields missing.' });
    }

    const startDate = start_date ? new Date(start_date) : new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const subNumber = `SUB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let newSub = null;

    if (prisma) {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

      newSub = await prisma.subscription.create({
        data: {
          userId,
          planId,
          subscription_number: subNumber,
          start_date: startDate,
          end_date: endDate,
          status: 'ACTIVE',
          delivery_address: deliveryAddress,
          delivery_time: deliveryTime,
          next_billing_date: endDate,
          next_delivery_date: startDate,
          payment_status: 'SUCCESS'
        },
        include: { plan: true }
      });
    } else {
      newSub = {
        id: `sub-${Date.now()}`,
        userId,
        planId,
        subscription_number: subNumber,
        start_date: startDate,
        end_date: endDate,
        status: 'ACTIVE',
        delivery_address: deliveryAddress,
        delivery_time: deliveryTime,
        next_billing_date: endDate,
        next_delivery_date: startDate,
        payment_status: 'SUCCESS',
        created_at: new Date(),
        updated_at: new Date()
      };
      memoryDb.subscriptions = memoryDb.subscriptions || [];
      memoryDb.subscriptions.unshift(newSub);
    }

    // Auto-generate meal calendar
    await generateMealCalendar(newSub);

    return res.status(201).json({
      success: true,
      message: 'Subscription activated!',
      subscription: newSub
    });
  } catch (err) {
    next(err);
  }
};

const pauseSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pauseFrom, resumeOn } = req.body;
    const userId = req.user.id;

    if (!pauseFrom || !resumeOn) {
      return res.status(400).json({ success: false, message: 'Pause start and resume dates are required.' });
    }

    const pauseStart = new Date(pauseFrom);
    const pauseEnd = new Date(resumeOn);
    const pauseDays = Math.ceil((pauseEnd - pauseStart) / (24 * 60 * 60 * 1000));

    if (pauseDays <= 0) {
      return res.status(400).json({ success: false, message: 'Resume date must be after pause date.' });
    }

    let sub = null;
    if (prisma) {
      sub = await prisma.subscription.findUnique({ where: { id } });
    } else {
      sub = (memoryDb.subscriptions || []).find(s => s.id === id);
    }

    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });
    if (sub.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const currentEndDate = new Date(sub.end_date);
    const newEndDate = new Date(currentEndDate.getTime() + pauseDays * 24 * 60 * 60 * 1000);

    if (prisma) {
      await prisma.subscription.update({
        where: { id },
        data: {
          status: 'PAUSED',
          pause_start: pauseStart,
          pause_end: pauseEnd,
          end_date: newEndDate,
          next_billing_date: newEndDate
        }
      });

      // Mark meals falling into the paused interval as SKIPPED
      await prisma.mealSchedule.updateMany({
        where: {
          subscriptionId: id,
          delivery_date: { gte: pauseStart, lte: pauseEnd },
          status: 'UPCOMING'
        },
        data: { status: 'SKIPPED' }
      });

      // Fetch active plan
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: sub.planId } });

      // Generate replacement meals at the end
      const mealsToCreate = [];
      const isBeast = sub.planId === 'plan-beast';
      const mealsList = isBeast
        ? ["Double Protein Paneer & Sprouts Bowl", "Athlete Muscle Charger Bowl", "Super Sprouts Whey Boost Bowl"]
        : ["High Protein Paneer Bowl", "Quinoa Salad Bowl", "Detox Sprouts Salad"];

      for (let i = 0; i < pauseDays; i++) {
        const offsetDate = new Date(currentEndDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
        mealsToCreate.push({
          id: `meal-repl-${id}-${i}-${Date.now().toString(36)}`,
          subscriptionId: id,
          userId: sub.userId,
          delivery_date: offsetDate,
          meal_type: 'BOWL',
          meal_name: mealsList[i % mealsList.length],
          protein_grams: isBeast ? 64 : 40,
          quantity: 1,
          status: 'UPCOMING',
          delivery_time: sub.delivery_time,
          address: sub.delivery_address,
          customization_status: 'PENDING'
        });
      }

      await prisma.mealSchedule.createMany({ data: mealsToCreate });
    } else {
      sub.status = 'PAUSED';
      sub.pause_start = pauseStart;
      sub.pause_end = pauseEnd;
      sub.end_date = newEndDate;
      sub.next_billing_date = newEndDate;

      // In-memory skipped updates
      (memoryDb.mealSchedules || []).forEach(m => {
        if (m.subscriptionId === id && new Date(m.delivery_date) >= pauseStart && new Date(m.delivery_date) <= pauseEnd && m.status === 'UPCOMING') {
          m.status = 'SKIPPED';
        }
      });

      // Appending replacements in-memory
      for (let i = 0; i < pauseDays; i++) {
        const offsetDate = new Date(currentEndDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
        memoryDb.mealSchedules.push({
          id: `meal-repl-${id}-${i}-${Date.now().toString(36)}`,
          subscriptionId: id,
          userId: sub.userId,
          delivery_date: offsetDate,
          meal_type: 'BOWL',
          meal_name: isBeast ? "Double Protein Paneer & Sprouts Bowl" : "High Protein Paneer Bowl",
          protein_grams: isBeast ? 64 : 40,
          quantity: 1,
          status: 'UPCOMING',
          delivery_time: sub.delivery_time,
          address: sub.delivery_address,
          customization_status: 'PENDING'
        });
      }
    }

    return res.json({ success: true, message: 'Subscription successfully paused, and calendar adjusted.' });
  } catch (err) {
    next(err);
  }
};

const resumeSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let sub = null;
    if (prisma) {
      sub = await prisma.subscription.findUnique({ where: { id } });
    } else {
      sub = (memoryDb.subscriptions || []).find(s => s.id === id);
    }

    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });
    if (sub.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (sub.status !== 'PAUSED') {
      return res.status(400).json({ success: false, message: 'Subscription is not paused.' });
    }

    if (prisma) {
      await prisma.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          pause_start: null,
          pause_end: null
        }
      });
    } else {
      sub.status = 'ACTIVE';
      sub.pause_start = null;
      sub.pause_end = null;
    }

    return res.json({ success: true, message: 'Subscription successfully resumed.' });
  } catch (err) {
    next(err);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    let sub = null;
    if (prisma) {
      sub = await prisma.subscription.findUnique({ where: { id } });
    } else {
      sub = (memoryDb.subscriptions || []).find(s => s.id === id);
    }

    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });
    if (sub.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (prisma) {
      await prisma.subscription.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          auto_renew: false
        }
      });
      // Cancel upcoming meals
      await prisma.mealSchedule.updateMany({
        where: {
          subscriptionId: id,
          status: 'UPCOMING'
        },
        data: { status: 'CANCELLED' }
      });
    } else {
      sub.status = 'CANCELLED';
      sub.auto_renew = false;

      (memoryDb.mealSchedules || []).forEach(m => {
        if (m.subscriptionId === id && m.status === 'UPCOMING') {
          m.status = 'CANCELLED';
        }
      });
    }

    console.log(`❌ Subscription ${sub.subscription_number} cancelled. Reason: ${reason || 'N/A'}`);

    return res.json({ success: true, message: 'Subscription cancelled successfully.' });
  } catch (err) {
    next(err);
  }
};

// ADMIN CONTROLLERS
const getAllSubscriptionsAdmin = async (req, res, next) => {
  try {
    if (prisma) {
      const list = await prisma.subscription.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true } },
          plan: true
        },
        orderBy: { created_at: 'desc' }
      });
      return res.json({ success: true, subscriptions: list });
    }

    const list = (memoryDb.subscriptions || []).map(s => {
      const user = memoryDb.users.find(u => u.id === s.userId) || {};
      const plan = memoryDb.subscriptionPlans.find(p => p.id === s.planId) || {};
      return {
        ...s,
        user: { name: user.name, email: user.email, phone: user.phone },
        plan
      };
    });

    return res.json({ success: true, subscriptions: list });
  } catch (err) {
    next(err);
  }
};

const updateSubscriptionAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { delivery_address, delivery_time, status, planId, end_date } = req.body;

    if (prisma) {
      const dataToUpdate = {};
      if (delivery_address) dataToUpdate.delivery_address = delivery_address;
      if (delivery_time) dataToUpdate.delivery_time = delivery_time;
      if (status) dataToUpdate.status = status;
      if (planId) dataToUpdate.planId = planId;
      if (end_date) dataToUpdate.end_date = new Date(end_date);

      const updated = await prisma.subscription.update({
        where: { id },
        data: dataToUpdate,
        include: { plan: true }
      });

      // Update upcoming meals addresses or times if changed
      if (delivery_address || delivery_time) {
        await prisma.mealSchedule.updateMany({
          where: {
            subscriptionId: id,
            status: 'UPCOMING'
          },
          data: {
            address: delivery_address || undefined,
            delivery_time: delivery_time || undefined
          }
        });
      }

      return res.json({ success: true, subscription: updated });
    }

    const sub = (memoryDb.subscriptions || []).find(s => s.id === id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });

    if (delivery_address) sub.delivery_address = delivery_address;
    if (delivery_time) sub.delivery_time = delivery_time;
    if (status) sub.status = status;
    if (planId) sub.planId = planId;
    if (end_date) sub.end_date = new Date(end_date);

    if (delivery_address || delivery_time) {
      (memoryDb.mealSchedules || []).forEach(m => {
        if (m.subscriptionId === id && m.status === 'UPCOMING') {
          if (delivery_address) m.address = delivery_address;
          if (delivery_time) m.delivery_time = delivery_time;
        }
      });
    }

    return res.json({ success: true, subscription: sub });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSubscriptionPlans,
  createSubscriptionPlanAdmin,
  updateSubscriptionPlanAdmin,
  deleteSubscriptionPlanAdmin,
  getCustomerSubscriptions,
  getSubscriptionById,
  createSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  getAllSubscriptionsAdmin,
  updateSubscriptionAdmin
};
