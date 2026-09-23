const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const AILog = require('../models/AILog');

// @desc    Get system-wide dashboard stats & analytics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSeekers,
      totalRecruiters,
      totalJobs,
      activeJobs,
      totalApplications,
      hiredCount,
      aiLogsCount,
      recentUsers,
      recentApplications,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'seeker' }),
      User.countDocuments({ role: 'recruiter' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'Accepted' }),
      AILog.countDocuments(),
      User.find().sort('-createdAt').limit(5).select('name email role createdAt isActive'),
      Application.find()
        .sort('-createdAt')
        .limit(5)
        .populate('job', 'title company')
        .populate('applicant', 'name email')
    ]);

    // AI performance metrics
    const aiStats = await AILog.aggregate([
      {
        $group: {
          _id: '$feature',
          count: { $sum: 1 },
          avgDuration: { $avg: '$durationMs' },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          seekers: totalSeekers,
          recruiters: totalRecruiters,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
        },
        applications: {
          total: totalApplications,
          hired: hiredCount,
        },
        aiOperations: {
          total: aiLogsCount,
          byFeature: aiStats,
        }
      },
      recentUsers,
      recentApplications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with search & filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user status or role
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const update = {};
    if (role) update.role = role;
    if (typeof isActive === 'boolean') update.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get AI execution logs
// @route   GET /api/admin/ai-logs
// @access  Private (Admin)
const getAILogs = async (req, res, next) => {
  try {
    const { feature, limit = 50 } = req.query;
    const query = {};
    if (feature) query.feature = feature;

    const logs = await AILog.find(query)
      .sort('-createdAt')
      .limit(Number(limit))
      .populate('user', 'name email role');

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAILogs,
};
