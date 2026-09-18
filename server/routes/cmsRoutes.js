const express = require('express');
const router = express.Router();
const { getCMSByKey, getAllCMS, updateCMSKey } = require('../controllers/cmsController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', getAllCMS);
router.get('/:key', getCMSByKey);
router.put('/:key', verifyToken, requireAdmin, updateCMSKey);

module.exports = router;
