const mongoose = require('mongoose');

const AILogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  feature: {
    type: String,
    enum: ['screening', 'recommendation', 'career_chat', 'interview_questions', 'resume_analysis'],
    required: true,
  },
  provider: {
    type: String,
    default: 'local-heuristic',
  },
  model: {
    type: String,
    default: 'default',
  },
  promptTokens: {
    type: Number,
    default: 0,
  },
  completionTokens: {
    type: Number,
    default: 0,
  },
  durationMs: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success',
  },
  error: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AILog', AILogSchema);
