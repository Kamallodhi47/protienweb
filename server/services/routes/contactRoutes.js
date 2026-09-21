const express = require('express');
const router = express.Router();
const { submitContact, getAllContacts, deleteContact } = require('../controllers/contactController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Public — submit contact form
router.post('/', submitContact);

// Admin only — view all submissions
router.get('/', verifyToken, requireAdmin, getAllContacts);

// Admin only — delete a submission
router.delete('/:id', verifyToken, requireAdmin, deleteContact);

module.exports = router;
