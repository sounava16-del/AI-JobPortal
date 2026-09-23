const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['seeker', 'recruiter', 'admin'],
    default: 'seeker',
  },
  avatar: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  location: {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  bio: {
    type: String,
    default: '',
  },
  // Job Seeker specific fields
  headline: {
    type: String,
    default: '',
  },
  skills: {
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
    fieldOfStudy: String,
    fromYear: Number,
    toYear: Number,
  }],
  portfolioLinks: [{
    label: String,
    url: String,
  }],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  }],
  // Recruiter specific fields
  company: {
    name: { type: String, default: '' },
    website: { type: String, default: '' },
    logo: { type: String, default: '' },
    size: { type: String, default: '1-10' },
    industry: { type: String, default: 'Technology' },
    description: { type: String, default: '' },
  },
  // Two-Factor Authentication (OTP)
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorOtp: {
    type: String,
    select: false,
  },
  twoFactorOtpExpires: {
    type: Date,
    select: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for geo-queries
UserSchema.index({ 'location.coordinates': '2dsphere' });

// Encrypt password using bcrypt before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match entered password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Signed JWT Token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'dev_secret_key_123',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = mongoose.model('User', UserSchema);
