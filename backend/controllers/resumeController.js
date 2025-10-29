const Resume = require('../models/Resume');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

/**
 * Get all resumes
 */
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch resumes',
        code: 'FETCH_RESUMES_ERROR',
        details: error.message,
      },
    });
  }
};

/**
 * Get single resume by ID
 */
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate('ownerJob');

    if (!resume) {
      return res.status(404).json({
        error: {
          message: 'Resume not found',
          code: 'RESUME_NOT_FOUND',
        },
      });
    }

    res.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch resume',
        code: 'FETCH_RESUME_ERROR',
        details: error.message,
      },
    });
  }
};

/**
 * Upload and extract text from resume file
 */
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file && !req.body.baseResumeText) {
      return res.status(400).json({
        error: {
          message: 'No file or text provided',
          code: 'VALIDATION_ERROR',
          details: 'Either upload a file or provide baseResumeText',
        },
      });
    }

    let extractedText = req.body.baseResumeText || '';
    const fileData = [];

    // Extract text from file if uploaded
    if (req.file) {
      const filePath = req.file.path;
      const mimeType = req.file.mimetype;

      fileData.push({
        filename: req.file.filename,
        path: req.file.path,
        mimeType: req.file.mimetype,
        uploadedAt: new Date(),
      });

      try {
        if (mimeType === 'application/pdf') {
          const dataBuffer = await fs.readFile(filePath);
          const pdfData = await pdfParse(dataBuffer);
          extractedText = pdfData.text;
        } else if (
          mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          mimeType === 'application/msword'
        ) {
          const result = await mammoth.extractRawText({ path: filePath });
          extractedText = result.value;
        } else if (mimeType === 'text/plain') {
          extractedText = await fs.readFile(filePath, 'utf-8');
        }
      } catch (extractError) {
        console.warn('Text extraction failed:', extractError);
        // Keep file but use provided text or empty string
      }
    }

    const resume = new Resume({
      baseResumeText: extractedText,
      files: fileData,
    });

    await resume.save();

    res.status(201).json(resume);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({
      error: {
        message: 'Failed to upload resume',
        code: 'UPLOAD_RESUME_ERROR',
        details: error.message,
      },
    });
  }
};

/**
 * Update resume text
 */
exports.updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const { baseResumeText, optimizedResumeText } = req.body;

    const updates = {};
    if (baseResumeText !== undefined) updates.baseResumeText = baseResumeText;
    if (optimizedResumeText !== undefined) updates.optimizedResumeText = optimizedResumeText;

    const resume = await Resume.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!resume) {
      return res.status(404).json({
        error: {
          message: 'Resume not found',
          code: 'RESUME_NOT_FOUND',
        },
      });
    }

    res.json(resume);
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update resume',
        code: 'UPDATE_RESUME_ERROR',
        details: error.message,
      },
    });
  }
};

/**
 * Delete resume
 */
exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        error: {
          message: 'Resume not found',
          code: 'RESUME_NOT_FOUND',
        },
      });
    }

    // Delete associated files
    for (const file of resume.files) {
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.warn(`Could not delete file ${file.path}:`, err);
      }
    }

    await Resume.findByIdAndDelete(id);

    res.json({ message: 'Resume deleted successfully', resumeId: id });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete resume',
        code: 'DELETE_RESUME_ERROR',
        details: error.message,
      },
    });
  }
};
