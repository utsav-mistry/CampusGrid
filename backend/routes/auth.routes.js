import express from 'express';
import { body } from 'express-validator';
import {
  register,
  sendOTPHandler,
  verifyOTPHandler,
  login,
  logout,
  getMe,
  linkUniversityEmail,
  verifyUniversityEmail
} from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').isIn(['student', 'recruiter'])
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const linkUniversityEmailValidation = [
  body('universityEmail').isEmail().normalizeEmail().custom(value => {
    if (!value.endsWith('@mail.ljku.edu.in')) {
      throw new Error('Must be a valid LJ University email');
    }
    return true;
  }),
  body('universityPassword').isLength({ min: 6 })
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/send-otp', body('email').isEmail(), sendOTPHandler);
router.post('/verify-otp', [
  body('email').isEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
  body('purpose').isIn(['registration', 'login', 'password_reset'])
], verifyOTPHandler);
router.post('/login', loginValidation, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);

// Student-only routes for university email
router.post('/link-university-email', protect, authorize('student'), linkUniversityEmailValidation, linkUniversityEmail);
router.post('/verify-university-email', protect, authorize('student'), [
  body('otp').isLength({ min: 6, max: 6 })
], verifyUniversityEmail);

export default router;
