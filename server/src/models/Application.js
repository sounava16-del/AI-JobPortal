const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
  },
  coverLetter: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Rejected', 'Accepted'],
    default: 'Applied',
  },
  aiMatchScore: {
    type: Number,
    default: 0, // 0 - 100
  },
  aiAnalysis: {
    matchSummary: { type: String, default: '' },
    skillMatchPercentage: { type: Number, default: 0 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    experienceFit: { type: String, default: '' },
    recommendation: {
      type: String,
      enum: ['Strong Hire', 'Hire', 'Borderline', 'Not Recommended', 'Pending Review'],
      default: 'Pending Review',
    },
  },
  interviewQuestions: [{
    question: String,
    category: String,
    expectedAnswer: String,
  }],
  recruiterNotes: {
    type: String,
    default: '',
  },
  statusTimeline: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  }],
}, {
  timestamps: true,
});

// Ensure a user can only apply once to a specific job
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
