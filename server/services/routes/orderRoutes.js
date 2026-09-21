const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateDailyDeliveryLog,
  updateOrderPaymentStatus
} = require('../controllers/orderController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/', verifyToken, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/', verifyToken, requireAdmin, getAllOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/status', verifyToken, requireAdmin, updateOrderStatus);
router.put('/:id/payment-status', verifyToken, updateOrderPaymentStatus);
router.put('/:id/daily-delivery', verifyToken, requireAdmin, updateDailyDeliveryLog);

module.exports = router;
