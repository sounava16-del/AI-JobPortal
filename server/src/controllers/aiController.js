const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const {
  screenResume,
  getJobRecommendations,
  careerChat,
  generateInterviewQuestions,
} = require('../services/aiService');

// @desc    Get AI Job Recommendations for current Seeker
// @route   GET /api/ai/recommendations
// @access  Private (Seeker)
const getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const activeJobs = await Job.find({ status: 'active' }).populate('recruiter', 'name company');

    const defaultResume = await Resume.findOne({ user: req.user.id, isDefault: true });
    const userSkills = [...new Set([...(user.skills || []), ...(defaultResume?.parsedSkills || [])])];

    const recommendations = await getJobRecommendations(
      req.user.id,
      userSkills,
      user.headline || '',
      activeJobs
    );

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Career Guidance Chatbot
// @route   POST /api/ai/career-chat
// @access  Private (Seeker)
const careerCoachChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const user = await User.findById(req.user.id);
    const result = await careerChat(
      req.user.id,
      message.trim(),
      Array.isArray(history) ? history : [],
      {
        skills: user?.skills || [],
        experienceYears: user?.experienceYears || 0,
        headline: user?.headline || ''
      }
    );

    res.status(200).json({
      success: true,
      reply: result.reply,
      provider: result.provider,
      model: result.model
    });
  } catch (err) {
    console.error('Career Coach Chat Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate career advice from AI provider.'
    });
  }
};

// @desc    Generate AI Interview Questions for an applicant/job
// @route   POST /api/ai/interview-questions/:applicationId
// @access  Private (Recruiter/Admin)
const generateQuestionsForApplicant = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId)
      .populate('job')
      .populate('resume')
      .populate('applicant');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify recruiter
    if (application.job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this candidate' });
    }

    const resumeText = application.resume?.parsedText || `${application.applicant.headline} Skills: ${application.applicant.skills.join(', ')}`;
    const questions = await generateInterviewQuestions(
      req.user.id,
      application.job,
      resumeText
    );

    // Save generated questions to application
    application.interviewQuestions = questions;
    await application.save();

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Test / Screen resume manually against custom JD
// @route   POST /api/ai/screen-custom
// @access  Private
const screenCustom = async (req, res, next) => {
  try {
    const { resumeText, jobDescription, requiredSkills } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ success: false, message: 'Resume text and Job description are required' });
    }

    const result = await screenResume(req.user.id, resumeText, jobDescription, requiredSkills || []);
    res.status(200).json({
      success: true,
      result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecommendations,
  careerCoachChat,
  generateQuestionsForApplicant,
  screenCustom
};
