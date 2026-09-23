const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verify2FA,
  toggle2FA,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/toggle-2fa', protect, toggle2FA);

module.exports = router;
