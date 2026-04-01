const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middleware/authenticate');

// AI Features endpoints
router.post('/categorize', authenticate, aiController.categorize);
router.post('/check-duplicate', authenticate, aiController.checkDuplicate);
router.post('/search', aiController.search);

module.exports = router;
