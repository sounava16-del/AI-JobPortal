const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecruiterJobs,
  toggleSaveJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Recruiter routes
router.get('/recruiter/my-jobs', protect, authorize('recruiter', 'admin'), getRecruiterJobs);
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

// Seeker save route
router.post('/:id/save', protect, toggleSaveJob);

module.exports = router;
