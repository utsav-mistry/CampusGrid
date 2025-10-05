/**
 * Exam Concurrency Middleware
 * Optimizes for 600-1000 students taking exams simultaneously
 */

import rateLimit from 'express-rate-limit';

// Rate limiter specifically for exam operations
export const examStartLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 1000, // Allow 1000 exam starts per minute
  message: 'Too many students starting exams. Please wait a moment.',
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID instead of IP for fair distribution
  keyGenerator: (req) => req.user?.id || req.ip
});

export const examSubmitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 answer submissions per minute per student
  message: 'Too many submissions. Please slow down.',
  keyGenerator: (req) => req.user?.id || req.ip
});

export const examFinishLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5, // Can only finish 5 times per minute (in case of errors)
  message: 'Too many finish attempts.',
  keyGenerator: (req) => req.user?.id || req.ip
});

// Middleware to add response caching headers for static exam data
export const cacheExamData = (req, res, next) => {
  // Cache exam details for 5 minutes (they don't change during exam)
  res.set('Cache-Control', 'public, max-age=300');
  next();
};

// Middleware to prevent duplicate exam starts
const activeExamStarts = new Map();

export const preventDuplicateStart = async (req, res, next) => {
  const userId = req.user.id;
  const examId = req.params.id || req.body.examId;
  const key = `${userId}-${examId}`;

  // Check if user is already starting this exam
  if (activeExamStarts.has(key)) {
    return res.status(429).json({
      success: false,
      message: 'Exam start already in progress. Please wait.'
    });
  }

  // Mark as in progress
  activeExamStarts.set(key, Date.now());

  // Clean up after 10 seconds
  setTimeout(() => {
    activeExamStarts.delete(key);
  }, 10000);

  next();
};

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of activeExamStarts.entries()) {
    if (now - timestamp > 10000) {
      activeExamStarts.delete(key);
    }
  }
}, 60000);

export default {
  examStartLimiter,
  examSubmitLimiter,
  examFinishLimiter,
  cacheExamData,
  preventDuplicateStart
};
