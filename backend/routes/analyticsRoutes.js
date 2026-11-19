const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getOverview, getTraffic, getPerformance, getRealSystem } = require('../controllers/analyticsController');

router.use(authMiddleware);
router.get('/overview', getOverview);
router.get('/traffic', getTraffic);
router.get('/performance', getPerformance);
router.get('/real-system', getRealSystem);
module.exports = router;