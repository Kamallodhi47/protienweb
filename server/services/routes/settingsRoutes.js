const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getBowlConfig,
  updateBowlConfig,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} = require('../controllers/settingsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', getSettings);
router.put('/', verifyToken, requireAdmin, updateSettings);

router.get('/bowl-config', getBowlConfig);
router.put('/bowl-config', verifyToken, requireAdmin, updateBowlConfig);

router.get('/subscription-plans', getSubscriptionPlans);
router.post('/subscription-plans', verifyToken, requireAdmin, createSubscriptionPlan);
router.put('/subscription-plans/:id', verifyToken, requireAdmin, updateSubscriptionPlan);
router.delete('/subscription-plans/:id', verifyToken, requireAdmin, deleteSubscriptionPlan);

module.exports = router;
