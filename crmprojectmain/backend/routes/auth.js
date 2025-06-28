const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtp);
router.get('/google', authController.googleLogin);
router.get('/facebook', authController.facebookLogin);

module.exports = router;
