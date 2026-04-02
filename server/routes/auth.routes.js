const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');

// Public routes
router.post('/register',    authController.register);
router.post('/verify-otp',  authController.verifyOtp);
router.post('/resend-otp',  authController.resendOtp);
router.post('/login',       authController.login);
router.post('/logout',      authController.logout);
router.post('/refresh',     authController.refresh);

// Protected routes (require JWT)
router.get('/me',                   authenticate, authController.getMe);
router.put('/profile',              authenticate, authController.updateProfile);
router.put('/change-password',      authenticate, authController.changePassword);

module.exports = router;
