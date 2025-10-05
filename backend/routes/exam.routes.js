import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  examStartLimiter,
  examSubmitLimiter,
  examFinishLimiter,
  cacheExamData,
  preventDuplicateStart
} from '../middleware/examConcurrency.js';
import {
  getAvailableExams,
  getExamDetails,
  startExam,
  submitAnswer,
  finishExam,
  reportViolation,
  getGeneralExamSubjects,
  startGeneralExam
} from '../controllers/exam.controller.js';

const router = express.Router();

// All routes require authentication and student role
router.use(protect);
router.use(authorize('student'));

// General exam routes (automatic, no human intervention)
router.get('/general/subjects', cacheExamData, getGeneralExamSubjects);
router.post('/general/start', examStartLimiter, preventDuplicateStart, startGeneralExam);

// Recruitment drive exam routes
router.get('/', getAvailableExams);
router.get('/:id', cacheExamData, getExamDetails);
router.post('/:id/start', examStartLimiter, preventDuplicateStart, startExam);

// Common routes for both exam types (use attemptId in body, not URL param)
router.post('/submit', examSubmitLimiter, submitAnswer);
router.post('/finish', examFinishLimiter, finishExam);
router.post('/violation', reportViolation);

export default router;
