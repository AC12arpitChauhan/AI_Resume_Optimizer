const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// GET /api/v1/jobs - Get all jobs
router.get('/', jobController.getJobs);

// GET /api/v1/jobs/:id - Get single job
router.get('/:id', jobController.getJobById);

// POST /api/v1/jobs - Create job
router.post('/', jobController.createJob);

// PUT /api/v1/jobs/:id - Update job
router.put('/:id', jobController.updateJob);

// DELETE /api/v1/jobs/:id - Delete job
router.delete('/:id', jobController.deleteJob);

module.exports = router;
