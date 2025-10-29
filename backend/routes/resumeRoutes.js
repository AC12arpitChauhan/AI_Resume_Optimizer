const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const upload = require('../utils/multerConfig');

// GET /api/v1/resumes - Get all resumes
router.get('/', resumeController.getResumes);

// GET /api/v1/resumes/:id - Get single resume
router.get('/:id', resumeController.getResumeById);

// POST /api/v1/resumes/upload - Upload resume
router.post('/upload', upload.single('file'), resumeController.uploadResume);

// PUT /api/v1/resumes/:id - Update resume
router.put('/:id', resumeController.updateResume);

// DELETE /api/v1/resumes/:id - Delete resume
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
