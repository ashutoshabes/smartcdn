const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getRules, addRule, toggleRule, deleteRule, getEvents, headersAudit } = require('../controllers/securityController');

router.use(authMiddleware);

router.get('/:websiteId/rules', getRules);
router.post('/:websiteId/rules', addRule);
router.put('/rules/:id/toggle', toggleRule);
router.delete('/rules/:id', deleteRule);
router.get('/:websiteId/events', getEvents);
router.get('/:websiteId/headers-audit', headersAudit);

module.exports = router;