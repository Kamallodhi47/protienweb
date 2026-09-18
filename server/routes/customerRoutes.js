const express = require('express');
const router = express.Router();
const { getCustomerAnalytics, getAddresses, addAddress, deleteAddress } = require('../controllers/customerController');
const { verifyToken, requireCustomer } = require('../middleware/auth');

router.get('/analytics', verifyToken, requireCustomer, getCustomerAnalytics);
router.get('/addresses', verifyToken, requireCustomer, getAddresses);
router.post('/addresses', verifyToken, requireCustomer, addAddress);
router.delete('/addresses/:id', verifyToken, requireCustomer, deleteAddress);

module.exports = router;
