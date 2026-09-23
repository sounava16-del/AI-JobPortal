const Resume = require('../models/Resume');
const User = require('../models/User');
const { parseResumePdf } = require('../services/resumeParser');
const { analyzeResumeAts } = require('../services/aiService');
const { uploadFile, deleteFile } = require('../services/s3Service');

// @desc    Upload and parse PDF resume with AI ATS analysis
// @route   POST /api/resumes/upload
// @access  Private (Seeker)
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume file' });
    }

    const userId = req.user.id;
    const file = req.file;

    // 1. Upload to S3 or local storage
    const storageResult = await uploadFile(file, 'resumes');

    // 2. Parse PDF text and extract candidate skills
    const parsedData = await parseResumePdf(file.path);

    // 3. Perform AI ATS analysis & feedback
    const atsFeedback = await analyzeResumeAts(userId, parsedData.text || '');

    // Reset previous default resumes if any
    await Resume.updateMany({ user: userId }, { isDefault: false });

    // 4. Save to Database
    const resume = await Resume.create({
      user: userId,
      fileName: file.originalname,
      fileUrl: storageResult.url,
      storageType: storageResult.storageType,
      fileSize: file.size,
      parsedText: parsedData.text || '',
      parsedSkills: parsedData.skills || [],
      experienceYears: parsedData.experienceYears || 0,
      atsScore: atsFeedback.atsScore || 70,
      feedback: {
        summary: atsFeedback.summary || '',
        strengths: atsFeedback.strengths || [],
        weaknesses: atsFeedback.weaknesses || [],
        missingKeywords: atsFeedback.missingKeywords || [],
        suggestions: atsFeedback.suggestions || []
      },
      isDefault: true
    });

    // Optionally update user skills if profile skills are currently empty
    const user = await User.findById(userId);
    if (user && (!user.skills || user.skills.length === 0) && parsedData.skills.length > 0) {
      user.skills = parsedData.skills;
      if (parsedData.experienceYears > 0 && !user.experienceYears) {
        user.experienceYears = parsedData.experienceYears;
      }
      await user.save();
    }

    res.status(201).json({
      success: true,
      resume,
      message: 'Resume uploaded, parsed, and analyzed successfully!'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all resumes for the logged-in seeker
// @route   GET /api/resumes/my-resumes
// @access  Private (Seeker)
const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Must be owner, recruiter viewing an applicant, or admin
    if (resume.user.toString() !== req.user.id && req.user.role === 'seeker') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this resume' });
    }

    res.status(200).json({
      success: true,
      resume
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Set a resume as default
// @route   PUT /api/resumes/:id/default
// @access  Private (Seeker)
const setDefaultResume = async (req, res, next) => {
  try {
    await Resume.updateMany({ user: req.user.id }, { isDefault: false });
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDefault: true },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.status(200).json({
      success: true,
      resume
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private (Seeker)
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    await deleteFile(resume.fileUrl, resume.storageType, resume.fileName);
    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadResume,
  getMyResumes,
  getResumeById,
  setDefaultResume,
  deleteResume
};
