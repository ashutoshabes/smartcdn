const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getWebsites, addWebsite, updateWebsite, deleteWebsite, checkHealth } = require('../controllers/websiteController');
router.use(authMiddleware); // every route below requires login

router.get('/', getWebsites);
router.post('/', addWebsite);
router.put('/:id', updateWebsite);
router.delete('/:id', deleteWebsite);
router.get('/:id/health', checkHealth);
module.exports = router;