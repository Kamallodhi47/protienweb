const express = require('express');
const router = express.Router();
const {
  getUpcomingMeals,
  getTomorrowMeal,
  customizeMeal,
  getCalendarBySubscriptionId,
  getAllMealsAdmin,
  updateMealStatusAdmin
} = require('../controllers/mealController');
const { verifyToken, requireAdmin, requireCustomer } = require('../middleware/auth');

router.get('/upcoming', verifyToken, requireCustomer, getUpcomingMeals);
router.get('/tomorrow', verifyToken, requireCustomer, getTomorrowMeal);
router.post('/:id/customize', verifyToken, requireCustomer, customizeMeal);
router.get('/calendar/:id', verifyToken, requireCustomer, getCalendarBySubscriptionId);

// Admin Routes
router.get('/admin/all', verifyToken, requireAdmin, getAllMealsAdmin);
router.put('/admin/:id/status', verifyToken, requireAdmin, updateMealStatusAdmin);

module.exports = router;
