const express = require('express');
const router = express.Router();
const {
  getProducts,
  getJuices,
  createJuice,
  updateJuice,
  deleteJuice,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/juices', getJuices);
router.post('/juices', verifyToken, requireAdmin, createJuice);
router.put('/juices/:id', verifyToken, requireAdmin, updateJuice);
router.delete('/juices/:id', verifyToken, requireAdmin, deleteJuice);

router.post('/', verifyToken, requireAdmin, createProduct);
router.put('/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

module.exports = router;
