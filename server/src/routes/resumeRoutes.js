const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getMyResumes,
  getResumeById,
  setDefaultResume,
  deleteResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { uploadResume: multerUpload } = require('../middleware/upload');

router.post('/upload', protect, authorize('seeker'), multerUpload.single('resume'), uploadResume);
router.get('/my-resumes', protect, authorize('seeker'), getMyResumes);
router.get('/:id', protect, getResumeById);
router.put('/:id/default', protect, authorize('seeker'), setDefaultResume);
router.delete('/:id', protect, authorize('seeker'), deleteResume);

module.exports = router;
