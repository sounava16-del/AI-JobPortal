const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  storageType: {
    type: String,
    enum: ['local', 's3'],
    default: 'local',
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  parsedText: {
    type: String,
    default: '',
  },
  parsedSkills: {
    type: [String],
    default: [],
  },
  experienceYears: {
    type: Number,
    default: 0,
  },
  education: [{
    institution: String,
    degree: String,
    year: String,
  }],
  atsScore: {
    type: Number,
    default: 0, // 0 - 100
  },
  feedback: {
    summary: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
  },
  isDefault: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Resume', ResumeSchema);
