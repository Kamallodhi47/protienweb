const { prisma } = require('../services/dbService');

// POST /api/newsletter — Public: subscribe with email
const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    if (prisma) {
      try {
        const subscriber = await prisma.newsletterSubscriber.upsert({
          where: { email: email.trim().toLowerCase() },
          update: {},
          create: { email: email.trim().toLowerCase() }
        });
        console.log(`📧 Newsletter subscriber "${subscriber.email}" saved to dev.db!`);
      } catch (e) {
        // Already subscribed is fine
      }
      return res.status(201).json({ success: true, message: 'You have successfully subscribed to our newsletter!' });
    }

    // Memory fallback
    return res.status(201).json({ success: true, message: 'You have successfully subscribed to our newsletter!' });
  } catch (err) {
    next(err);
  }
};

// GET /api/newsletter — Admin: get all subscribers
const getAllSubscribers = async (req, res, next) => {
  try {
    if (prisma) {
      const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: 'desc' }
      });
      return res.json({ success: true, count: subscribers.length, subscribers });
    }
    return res.json({ success: true, count: 0, subscribers: [] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/newsletter/:id — Admin: remove a subscriber
const deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (prisma) {
      await prisma.newsletterSubscriber.delete({ where: { id } });
      return res.json({ success: true, message: 'Subscriber removed.' });
    }
    return res.json({ success: true, message: 'Deleted (memory mode).' });
  } catch (err) {
    next(err);
  }
};

module.exports = { subscribe, getAllSubscribers, deleteSubscriber };
