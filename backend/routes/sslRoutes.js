const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { checkCertificate } = require('../controllers/sslController');

router.use(authMiddleware);
router.get('/:websiteId', checkCertificate);

module.exports = router;