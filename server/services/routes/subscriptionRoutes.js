const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/subscriptionController');
const { verifyToken, requireAdmin, requireCustomer } = require('../middleware/auth');

// Plans CRUD (Public / Customer / Admin)
router.get('/plans', getSubscriptionPlans);
router.post('/plans', verifyToken, requireAdmin, createSubscriptionPlanAdmin);
router.put('/plans/:id', verifyToken, requireAdmin, updateSubscriptionPlanAdmin);
router.delete('/plans/:id', verifyToken, requireAdmin, deleteSubscriptionPlanAdmin);

// Subscriptions
router.get('/my-subscriptions', verifyToken, requireCustomer, getCustomerSubscriptions);
router.get('/:id', verifyToken, getSubscriptionById);
router.post('/', verifyToken, requireCustomer, createSubscription);
router.post('/:id/pause', verifyToken, requireCustomer, pauseSubscription);
router.post('/:id/resume', verifyToken, requireCustomer, resumeSubscription);
router.post('/:id/cancel', verifyToken, requireCustomer, cancelSubscription);

// Admin Subscription Operations
router.get('/admin/all', verifyToken, requireAdmin, getAllSubscriptionsAdmin);
router.put('/admin/:id/update', verifyToken, requireAdmin, updateSubscriptionAdmin);

module.exports = router;
