const express = require('express');
const router = express.Router();
const {
  applyJob,
  getSeekerApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationById,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Seeker routes
router.post('/apply/:jobId', protect, authorize('seeker'), applyJob);
router.get('/my-applications', protect, authorize('seeker'), getSeekerApplications);

// Recruiter routes
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);

// Common route
router.get('/:id', protect, getApplicationById);

module.exports = router;
