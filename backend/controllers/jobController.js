const Job = require('../models/Job');
const Resume = require('../models/Resume');

/**
 * Get all jobs with pagination and filtering
 */
exports.getJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('baseResume', 'baseResumeText files')
      .populate('latestOptimizedResume', 'optimizedResumeText keywordsAdded')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch jobs',
        code: 'FETCH_JOBS_ERROR',
        details: error.message,
      },
    });
  }
};

/**
 * Get single job by ID
 */
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
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

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch job',
        code: 'FETCH_JOB_ERROR',
        details: error.message,
      },
    });
  }
};

/**
 * Create new job
 */
exports.createJob = async (req, res) => {
  try {
    const {
      clientName,
      companyName,
      position,
      jobDescription,
      jobApplicationLink,
      baseResumeId,
    } = req.body;

    // Validate required fields
    if (!clientName || !companyName || !position || !jobDescription) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields',
          code: 'VALIDATION_ERROR',
          details: 'clientName, companyName, position, and jobDescription are required',
        },
      });
    }

    // Verify resume exists if provided
    if (baseResumeId) {
      const resume = await Resume.findById(baseResumeId);
      if (!resume) {
        return res.status(404).json({
          error: {
            message: 'Base resume not found',
            code: 'RESUME_NOT_FOUND',
          },
        });
      }
    }

    const job = new Job({
      clientName,
      companyName,
      position,
      jobDescription,
      jobApplicationLink,
      baseResume: baseResumeId || null,
      status: 'Pending Optimization',
    });

    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('baseResume')
      .populate('latestOptimizedResume');

    // Emit socket event
    if (req.io) {
      req.io.emit('job:created', populatedJob);
    }

    res.status(201).json(populatedJob);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create job',
        code: 'CREATE_JOB_ERROR',
        details: error.message,
      },
    });
  }
};

/**
 * Update job
 */
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow direct updates to status, optimizedOn, changesSummary via this endpoint
    delete updates.status;
    delete updates.optimizedOn;
    delete updates.changesSummary;

    const job = await Job.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
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

    // Emit socket event
    if (req.io) {
      req.io.emit('job:updated', job);
    }

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update job',
        code: 'UPDATE_JOB_ERROR',
        details: error.message,
      },
    });
  }
};

/**
 * Delete job
 */
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        error: {
          message: 'Job not found',
          code: 'JOB_NOT_FOUND',
        },
      });
    }

    await Job.findByIdAndDelete(id);

    // Emit socket event
    if (req.io) {
      req.io.emit('job:deleted', { jobId: id });
    }

    res.json({ message: 'Job deleted successfully', jobId: id });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      error: {
        message: 'Failed to delete job',
        code: 'DELETE_JOB_ERROR',
        details: error.message,
      },
    });
  }
};
