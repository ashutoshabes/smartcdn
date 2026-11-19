const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getLogs } = require('../controllers/logsController');

router.use(authMiddleware);
router.get('/', getLogs);

module.exports = router;