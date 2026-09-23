const User = require('../models/User');

// Helper to generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, headline, skills, company } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const userData = {
      name,
      email,
      password,
      role: role || 'seeker',
      headline: headline || '',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      company: company || {}
    };

    const user = await User.create(userData);
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        headline: user.headline,
        company: user.company,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user & check 2FA
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password +twoFactorOtp +twoFactorOtpExpires');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      const otp = generateOtp();
      user.twoFactorOtp = otp;
      user.twoFactorOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await user.save({ validateBeforeSave: false });

      console.log(`🔑 [2FA OTP for ${user.email}]: ${otp}`);

      return res.status(200).json({
        success: true,
        requires2FA: true,
        userId: user._id,
        message: 'Two-factor authentication code sent to email (logged in console for dev mode)',
        // Provide OTP in dev mode for easy testing
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        headline: user.headline,
        company: user.company,
        avatar: user.avatar,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify 2FA OTP
// @route   POST /api/auth/verify-2fa
// @access  Public
const verify2FA = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and OTP are required' });
    }

    const user = await User.findById(userId).select('+twoFactorOtp +twoFactorOtpExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.twoFactorOtp || user.twoFactorOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    if (user.twoFactorOtpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP code has expired' });
    }

    // Clear OTP
    user.twoFactorOtp = undefined;
    user.twoFactorOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        headline: user.headline,
        company: user.company,
        avatar: user.avatar,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle 2FA for current user
// @route   PUT /api/auth/toggle-2fa
// @access  Private
const toggle2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
    await user.save();

    res.status(200).json({
      success: true,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      message: `Two-factor authentication ${user.isTwoFactorEnabled ? 'enabled' : 'disabled'}`
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('savedJobs');
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio,
      headline: req.body.headline,
      skills: req.body.skills,
      experienceYears: req.body.experienceYears,
      education: req.body.education,
      location: req.body.location,
      company: req.body.company,
      portfolioLinks: req.body.portfolioLinks
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  verify2FA,
  toggle2FA,
  getMe,
  updateProfile
};
