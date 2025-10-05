import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getProgress,
  getHistory,
  getBadges,
  getPrestige
} from '../controllers/progress.controller.js';

const router = express.Router();

// All routes require authentication and student role
router.use(protect);
router.use(authorize('student'));

router.get('/', getProgress);
router.get('/history', getHistory);
router.get('/badges', getBadges);
router.get('/prestige', getPrestige);

export default router;
