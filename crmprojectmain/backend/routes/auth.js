const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login → OTP → Dashboard
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);

// Only allowed after login email verified
router.post('/register', authController.register);

// Social Logins
router.get('/google', authController.googleLogin);
router.get('/facebook', authController.facebookLogin);

module.exports = router;
