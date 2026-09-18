const express = require('express');
const router = express.Router();
const {
  getIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  refillStock
} = require('../controllers/ingredientController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', getIngredients);
router.get('/:id', getIngredientById);
router.post('/', verifyToken, requireAdmin, createIngredient);
router.put('/:id', verifyToken, requireAdmin, updateIngredient);
router.delete('/:id', verifyToken, requireAdmin, deleteIngredient);
router.post('/refill', verifyToken, requireAdmin, refillStock);

module.exports = router;
