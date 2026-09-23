const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
const createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      recruiter: req.user.id,
      company: {
        name: req.body.companyName || req.user.company?.name || 'Independent Tech',
        logo: req.body.companyLogo || req.user.company?.logo || '',
        website: req.body.companyWebsite || req.user.company?.website || '',
      }
    };

    const job = await Job.create(jobData);
    res.status(201).json({
      success: true,
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all jobs with multi-facet filters & geo search
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      location,
      lat,
      lng,
      distanceKm = 50,
      jobType,
      workplaceType,
      experienceLevel,
      minSalary,
      maxSalary,
      skill,
      status = 'active',
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = { status };

    // Keyword search (title, description, company)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'company.name': { $regex: keyword, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    // Filter by city or location string
    if (location) {
      query.$or = query.$or || [];
      query.$or.push(
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } }
      );
    }

    // Geo-location radius search
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      const radiusMeters = distanceKm * 1000;
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radiusMeters
        }
      };
    }

    // Filter by Job Type (full-time, part-time, etc.)
    if (jobType) {
      query.jobType = jobType;
    }

    // Workplace type (remote, hybrid, on-site)
    if (workplaceType) {
      query['location.workplaceType'] = workplaceType;
    }

    // Experience Level
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Salary range
    if (minSalary || maxSalary) {
      query['salaryRange.min'] = {};
      if (minSalary) query['salaryRange.min'].$gte = Number(minSalary);
      if (maxSalary) query['salaryRange.max'] = { $lte: Number(maxSalary) };
    }

    // Filter by specific skill
    if (skill) {
      const skillsArr = skill.split(',').map(s => new RegExp(s.trim(), 'i'));
      query.skillsRequired = { $in: skillsArr };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('recruiter', 'name email company avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email company avatar');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    // Increment view count
    job.viewsCount = (job.viewsCount || 0) + 1;
    await job.save();

    res.status(200).json({
      success: true,
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Owner/Admin)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    // Authorization check
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      job,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or close a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Owner/Admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all jobs for logged in recruiter
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter)
const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Save/Bookmark or Unsave a job
// @route   POST /api/jobs/:id/save
// @access  Private (Seeker)
const toggleSaveJob = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const jobId = req.params.id;

    const isSaved = user.savedJobs.includes(jobId);
    if (isSaved) {
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isSaved: !isSaved,
      savedJobs: user.savedJobs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecruiterJobs,
  toggleSaveJob,
};
