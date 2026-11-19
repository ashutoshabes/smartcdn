const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getCache, deleteCacheEntry, clearCache } = require('../controllers/cacheController');

router.use(authMiddleware);

router.get('/', getCache);
router.delete('/clear', clearCache);   // must come BEFORE /:id, or "clear" gets treated as an :id
router.delete('/:id', deleteCacheEntry);

module.exports = router;