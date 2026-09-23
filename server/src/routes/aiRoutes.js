const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  careerCoachChat,
  generateQuestionsForApplicant,
  screenCustom,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Seeker AI features
router.get('/recommendations', protect, authorize('seeker'), getRecommendations);
router.post('/career-chat', protect, careerCoachChat);

// Recruiter AI features
router.post('/interview-questions/:applicationId', protect, authorize('recruiter', 'admin'), generateQuestionsForApplicant);

// General screening test
router.post('/screen-custom', protect, screenCustom);

module.exports = router;
