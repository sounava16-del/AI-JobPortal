const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { screenResume } = require('../services/aiService');
const { sendLiveNotification } = require('../services/socketService');

// @desc    Apply for a job with resume
// @route   POST /api/applications/apply/:jobId
// @access  Private (Seeker)
const applyJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const applicantId = req.user.id;
    const { resumeId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApp = await Application.findOne({ job: jobId, applicant: applicantId });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    // Find resume (either provided or user's default resume)
    let resume = null;
    if (resumeId) {
      resume = await Resume.findById(resumeId);
    } else {
      resume = await Resume.findOne({ user: applicantId, isDefault: true });
    }

    // Run AI Resume Screening
    let aiMatchScore = 70;
    let aiAnalysis = {
      matchSummary: 'Standard applicant evaluation',
      skillMatchPercentage: 70,
      matchedSkills: [],
      missingSkills: [],
      experienceFit: 'Profile under review',
      recommendation: 'Pending Review'
    };

    if (resume && resume.parsedText) {
      const screeningResult = await screenResume(
        applicantId,
        resume.parsedText,
        job.description,
        job.skillsRequired
      );
      aiMatchScore = screeningResult.score || 70;
      aiAnalysis = {
        matchSummary: screeningResult.matchSummary,
        skillMatchPercentage: screeningResult.skillMatchPercentage,
        matchedSkills: screeningResult.matchedSkills,
        missingSkills: screeningResult.missingSkills,
        experienceFit: screeningResult.experienceFit,
        recommendation: screeningResult.recommendation
      };
    }

    const application = await Application.create({
      job: jobId,
      applicant: applicantId,
      resume: resume ? resume._id : null,
      coverLetter: coverLetter || '',
      status: 'Applied',
      aiMatchScore,
      aiAnalysis,
      statusTimeline: [
        {
          status: 'Applied',
          note: 'Application submitted successfully',
          changedAt: new Date()
        }
      ]
    });

    // Increment job applicants count
    job.applicantsCount = (job.applicantsCount || 0) + 1;
    await job.save();

    // Notify Recruiter
    await sendLiveNotification(job.recruiter, {
      title: 'New Applicant Received!',
      message: `${req.user.name} applied for "${job.title}" (AI Match: ${aiMatchScore}%)`,
      type: 'new_applicant',
      link: `/recruiter/jobs/${job._id}/applicants`
    });

    res.status(201).json({
      success: true,
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applications submitted by logged-in seeker
// @route   GET /api/applications/my-applications
// @access  Private (Seeker)
const getSeekerApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate({
        path: 'job',
        select: 'title company location salaryRange jobType status recruiter',
        populate: { path: 'recruiter', select: 'name email' }
      })
      .populate('resume', 'fileName fileUrl atsScore')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all applicants for a job (ranked by AI Match Score)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter/Admin)
const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, sortBy = '-aiMatchScore' } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view applicants for this job' });
    }

    const query = { job: jobId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('applicant', 'name email phone avatar skills headline experienceYears')
      .populate('resume', 'fileName fileUrl atsScore feedback parsedSkills')
      .sort(sortBy);

    res.status(200).json({
      success: true,
      jobTitle: job.title,
      count: applications.length,
      applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status (Reviewing, Shortlisted, Interviewing, Rejected, Accepted)
// @route   PUT /api/applications/:id/status
// @access  Private (Recruiter/Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note, recruiterNotes } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('job', 'title recruiter')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this application' });
    }

    application.status = status;
    if (recruiterNotes !== undefined) {
      application.recruiterNotes = recruiterNotes;
    }

    application.statusTimeline.push({
      status,
      note: note || `Application status transitioned to ${status}`,
      changedAt: new Date()
    });

    await application.save();

    // Send Live notification to candidate
    await sendLiveNotification(application.applicant._id, {
      title: `Application Status Updated: ${status}`,
      message: `Your application for "${application.job.title}" has been updated to "${status}".`,
      type: 'application_status',
      link: '/seeker/applications'
    });

    res.status(200).json({
      success: true,
      application,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'name email phone avatar skills headline experienceYears')
      .populate('resume');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyJob,
  getSeekerApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationById,
};
