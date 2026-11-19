const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getEdgeServers, addEdgeServer, updateEdgeServer, updateEdgeStatus } = require('../controllers/edgeController');

router.use(authMiddleware);

router.get('/', getEdgeServers);
router.post('/', addEdgeServer);
router.put('/:id', updateEdgeServer);
router.put('/:id/status', updateEdgeStatus);

module.exports = router;
