const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    ownerJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    baseResumeText: {
      type: String,
    },
    optimizedResumeText: {
      type: String,
    },
    files: [
      {
        filename: String,
        path: String,
        mimeType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    keywordsAdded: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
