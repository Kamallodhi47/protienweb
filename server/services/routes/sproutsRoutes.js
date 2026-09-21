const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient
} = require('../controllers/sproutsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// ==================================================
// CATEGORIES ROUTES
// ==================================================
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', verifyToken, requireAdmin, createCategory);
router.put('/categories/:id', verifyToken, requireAdmin, updateCategory);
router.delete('/categories/:id', verifyToken, requireAdmin, deleteCategory);

// ==================================================
// INGREDIENTS ROUTES
// ==================================================
router.get('/ingredients', getIngredients);
router.get('/ingredients/:id', getIngredientById);
router.post('/ingredients', verifyToken, requireAdmin, createIngredient);
router.put('/ingredients/:id', verifyToken, requireAdmin, updateIngredient);
router.delete('/ingredients/:id', verifyToken, requireAdmin, deleteIngredient);

module.exports = router;
