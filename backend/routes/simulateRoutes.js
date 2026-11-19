const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { simulateRequest, detectLocation } = require('../controllers/simulateController');
const { simulateLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware);
router.post('/request', simulateLimiter, simulateRequest);
router.get('/detect-location', detectLocation);

module.exports = router;