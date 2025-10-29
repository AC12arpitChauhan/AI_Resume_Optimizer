const express = require('express');
const router = express.Router();
const optimizeController = require('../controllers/optimizeController');
const { optimizeRateLimiter } = require('../utils/rateLimiter');

// POST /api/v1/optimize - Optimize single job
router.post('/', optimizeRateLimiter, optimizeController.optimizeResume);

// POST /api/v1/optimize/batch - Batch optimize jobs
router.post('/batch', optimizeRateLimiter, optimizeController.batchOptimize);

// GET /api/v1/optimize/diff/:jobId - Get diff for job
router.get('/diff/:jobId', optimizeController.getDiff);

module.exports = router;
