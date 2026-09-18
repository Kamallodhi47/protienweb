const express = require('express');
const router = express.Router();
const { subscribe, getAllSubscribers, deleteSubscriber } = require('../controllers/newsletterController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public — subscribe
router.post('/subscribe', subscribe);

// Admin only — all subscribers
router.get('/', verifyToken, requireAdmin, getAllSubscribers);

// Admin only — remove subscriber
router.delete('/:id', verifyToken, requireAdmin, deleteSubscriber);

module.exports = router;
