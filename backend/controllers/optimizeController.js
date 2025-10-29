const Job = require('../models/Job');
const Resume = require('../models/Resume');
const geminiService = require('../services/geminiService');
const { generateDiff, getDiffStats } = require('../services/diffService');

/**
 * Optimize resume for a specific job
 */
exports.optimizeResume = async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        error: {
          message: 'Missing jobId',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Fetch job
    const job = await Job.findById(jobId).populate('baseResume');

    if (!job) {
      return res.status(404).json({
        error: {
          message: 'Job not found',
          code: 'JOB_NOT_FOUND',
        },
      });
    }

    // Determine which resume to use
    let baseResume;
    if (resumeId) {
      baseResume = await Resume.findById(resumeId);
      if (!baseResume) {
        return res.status(404).json({
          error: {
            message: 'Resume not found',
            code: 'RESUME_NOT_FOUND',
          },
        });
      }
    } else if (job.baseResume) {
      baseResume = job.baseResume;
    } else {
      return res.status(400).json({
        error: {
          message: 'No resume associated with job',
          code: 'NO_RESUME_ERROR',
          details: 'Job must have a baseResume or provide resumeId',
        },
      });
    }

    const baseResumeText = baseResume.baseResumeText;

    if (!baseResumeText || baseResumeText.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Resume has no text content',
          code: 'EMPTY_RESUME_ERROR',
        },
      });
    }

    // Call Gemini to optimize
    console.log(`Optimizing resume for job ${jobId}...`);
    const optimizedResumeText = await geminiService.optimizeResume(
      job.jobDescription,
      baseResumeText
    );

    // Call Gemini to generate change summary
    console.log('Generating change summary...');
    const changesSummary = await geminiService.summarizeChanges(
      baseResumeText,
      optimizedResumeText
    );

    // Create or update optimized resume document
    let optimizedResume = await Resume.findById(job.latestOptimizedResume);

    if (optimizedResume) {
      // Update existing
      optimizedResume.optimizedResumeText = optimizedResumeText;
      optimizedResume.keywordsAdded = changesSummary.keywordsAdded;
      await optimizedResume.save();
    } else {
      // Create new optimized resume
      optimizedResume = new Resume({
        ownerJob: job._id,
        baseResumeText: baseResumeText,
        optimizedResumeText: optimizedResumeText,
        keywordsAdded: changesSummary.keywordsAdded,
      });
      await optimizedResume.save();
    }

    // Update job with optimization results
    job.status = 'Optimized';
    job.optimizedOn = new Date();
    job.changesSummary = changesSummary.headline;
    job.latestOptimizedResume = optimizedResume._id;

    if (resumeId && resumeId !== job.baseResume?._id?.toString()) {
      job.baseResume = resumeId;
    }

    await job.save();

    // Populate job for response
    const populatedJob = await Job.findById(job._id)
      .populate('baseResume')
      .populate('latestOptimizedResume');

    // Emit socket event
    if (req.io) {
      req.io.emit('job:updated', populatedJob);
    }

    // Generate diff
    const diff = generateDiff(baseResumeText, optimizedResumeText);
    const diffStats = getDiffStats(diff.lineDiff);

    res.json({
      jobId: job._id,
      optimizedResumeText: optimizedResumeText,
      changesSummary: changesSummary,
      updatedJob: {
        status: job.status,
        optimizedOn: job.optimizedOn,
        changesSummary: job.changesSummary,
      },
      diff: {
        ...diff,
        stats: diffStats,
      },
    });
  } catch (error) {
    console.error('Error optimizing resume:', error);

    // Check if it's a Gemini API error
    if (error.message?.includes('Gemini API')) {
      return res.status(503).json({
        error: {
          message: 'AI service temporarily unavailable',
          code: 'AI_SERVICE_ERROR',
          details: error.message,
        },
      });
    }

    res.status(500).json({
      error: {
        message: 'Failed to optimize resume',
        code: 'OPTIMIZE_ERROR',
        details: error.message,
      },
    });
  }
};

/**
 * Batch optimize multiple jobs
 */
exports.batchOptimize = async (req, res) => {
  try {
    const { jobIds } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({
        error: {
          message: 'jobIds must be a non-empty array',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const results = [];
    const errors = [];

    for (const jobId of jobIds) {
      try {
        // Simulate the optimize process
        const job = await Job.findById(jobId).populate('baseResume');

        if (!job) {
          errors.push({ jobId, error: 'Job not found' });
          continue;
        }

        if (!job.baseResume || !job.baseResume.baseResumeText) {
          errors.push({ jobId, error: 'No resume text available' });
          continue;
        }

        const optimizedResumeText = await geminiService.optimizeResume(
          job.jobDescription,
          job.baseResume.baseResumeText
        );

        const changesSummary = await geminiService.summarizeChanges(
          job.baseResume.baseResumeText,
          optimizedResumeText
        );

        let optimizedResume = new Resume({
          ownerJob: job._id,
          baseResumeText: job.baseResume.baseResumeText,
          optimizedResumeText: optimizedResumeText,
          keywordsAdded: changesSummary.keywordsAdded,
        });
        await optimizedResume.save();

        job.status = 'Optimized';
        job.optimizedOn = new Date();
        job.changesSummary = changesSummary.headline;
        job.latestOptimizedResume = optimizedResume._id;
        await job.save();

        results.push({ jobId, status: 'success' });

        // Emit socket event
        if (req.io) {
          const populatedJob = await Job.findById(job._id)
            .populate('baseResume')
            .populate('latestOptimizedResume');
          req.io.emit('job:updated', populatedJob);
        }

        // Add delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error optimizing job ${jobId}:`, error);
        errors.push({ jobId, error: error.message });
      }
    }

    res.json({
      message: 'Batch optimization completed',
      results,
      errors,
      summary: {
        total: jobIds.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error('Error in batch optimize:', error);
    res.status(500).json({
      error: {
        message: 'Batch optimization failed',
        code: 'BATCH_OPTIMIZE_ERROR',
        details: error.message,
      },
    });
  }
};

/**
 * Get diff between base and optimized resume
 */
exports.getDiff = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate('baseResume')
      .populate('latestOptimizedResume');

    if (!job) {
      return res.status(404).json({
        error: {
          message: 'Job not found',
          code: 'JOB_NOT_FOUND',
        },
      });
    }

    if (!job.baseResume || !job.latestOptimizedResume) {
      return res.status(400).json({
        error: {
          message: 'Job does not have both base and optimized resumes',
          code: 'MISSING_RESUMES_ERROR',
        },
      });
    }

    const baseText = job.baseResume.baseResumeText || '';
    const optimizedText = job.latestOptimizedResume.optimizedResumeText || '';

    const diff = generateDiff(baseText, optimizedText);
    const diffStats = getDiffStats(diff.lineDiff);

    res.json({
      jobId: job._id,
      diff: {
        ...diff,
        stats: diffStats,
      },
      changesSummary: job.changesSummary,
      keywordsAdded: job.latestOptimizedResume.keywordsAdded,
    });
  } catch (error) {
    console.error('Error generating diff:', error);
    res.status(500).json({
      error: {
        message: 'Failed to generate diff',
        code: 'DIFF_ERROR',
        details: error.message,
      },
    });
  }
};
