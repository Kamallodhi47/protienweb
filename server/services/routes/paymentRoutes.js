const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  handlePaymentWebhook,
  getPaymentHistory,
  getAllPaymentsAdmin
} = require('../controllers/paymentController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/create-order', verifyToken, createPaymentOrder);
router.post('/verify', verifyToken, verifyPayment);
router.post('/webhook', handlePaymentWebhook); // Webhook has no token auth (Razorpay validates signature)
router.get('/history', verifyToken, getPaymentHistory);
router.get('/admin/all', verifyToken, requireAdmin, getAllPaymentsAdmin);

module.exports = router;
