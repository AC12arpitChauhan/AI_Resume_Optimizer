const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    jobApplicationLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending Optimization', 'Optimized'],
      default: 'Pending Optimization',
    },
    baseResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    latestOptimizedResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    optimizedOn: {
      type: Date,
    },
    changesSummary: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for filtering by status
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
