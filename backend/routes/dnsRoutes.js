const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getRecords, addRecord, updateRecord, deleteRecord } = require('../controllers/dnsController');

router.use(authMiddleware);

router.get('/:websiteId', getRecords);
router.post('/:websiteId', addRecord);
router.put('/record/:id', updateRecord);
router.delete('/record/:id', deleteRecord);

module.exports = router;