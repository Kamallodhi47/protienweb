const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllCustomers,
  createCustomer,
  updateCustomer,
  updateCustomerRole,
  deleteCustomer
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/stats', verifyToken, requireAdmin, getDashboardStats);
router.get('/dashboard-stats', verifyToken, requireAdmin, getDashboardStats);
router.get('/customers', verifyToken, requireAdmin, getAllCustomers);
router.post('/customers', verifyToken, requireAdmin, createCustomer);
router.put('/customers/:id', verifyToken, requireAdmin, updateCustomer);
router.put('/customers/:id/role', verifyToken, requireAdmin, updateCustomerRole);
router.delete('/customers/:id', verifyToken, requireAdmin, deleteCustomer);

module.exports = router;
