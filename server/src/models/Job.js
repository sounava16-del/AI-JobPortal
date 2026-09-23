const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true,
  },
  company: {
    name: { type: String, required: true },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a job description'],
  },
  requirements: {
    type: [String],
    default: [],
  },
  responsibilities: {
    type: [String],
    default: [],
  },
  skillsRequired: {
    type: [String],
    default: [],
  },
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    isRemote: { type: Boolean, default: false },
    workplaceType: {
      type: String,
      enum: ['on-site', 'remote', 'hybrid'],
      default: 'on-site',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    default: 'full-time',
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid',
  },
  salaryRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    isNegotiable: { type: Boolean, default: false },
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active',
  },
  applicantsCount: {
    type: Number,
    default: 0,
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Text index for keyword searches
JobSchema.index({
  title: 'text',
  description: 'text',
  skillsRequired: 'text',
  'company.name': 'text',
  'location.city': 'text'
});

// Geo index for location radius search
JobSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Job', JobSchema);
