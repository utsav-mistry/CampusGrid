import StudentProgress from '../models/StudentProgress.js';
import ExamAttempt from '../models/ExamAttempt.js';
import { calculatePrestige } from '../utils/progressCalculator.js';

/**
 * @desc    Get student progress
 * @route   GET /api/progress
 * @access  Private (Student)
 */
export const getProgress = async (req, res) => {
  try {
    let progress = await StudentProgress.findOne({ studentId: req.user._id })
      .populate('subjects.subjectId', 'name code');

    if (!progress) {
      // Create initial progress document
      progress = await StudentProgress.create({
        studentId: req.user._id,
        subjects: [],
        totalPrestige: 0,
        genericBadges: [],
        stats: {
          totalExams: 0,
          totalViolations: 0,
          currentStreak: 0
        }
      });
    }

    res.json({
      success: true,
      data: progress
    });

  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

/**
 * @desc    Get exam history
 * @route   GET /api/progress/history
 * @access  Private (Student)
 */
export const getHistory = async (req, res) => {
  try {
    const { subject, level, status, limit = 50, page = 1 } = req.query;

    const query = { studentId: req.user._id };
    
    if (subject) query.subjectId = subject;
    if (level) query.level = level;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const attempts = await ExamAttempt.find(query)
      .populate('examId', 'title')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ExamAttempt.countDocuments(query);

    res.json({
      success: true,
      count: attempts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: attempts
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam history',
      error: error.message
    });
  }
};

/**
 * @desc    Get all badges
 * @route   GET /api/progress/badges
 * @access  Private (Student)
 */
export const getBadges = async (req, res) => {
  try {
    const progress = await StudentProgress.findOne({ studentId: req.user._id })
      .populate('subjects.subjectId', 'name code');

    if (!progress) {
      return res.json({
        success: true,
        data: {
          subjectBadges: [],
          genericBadges: []
        }
      });
    }

    // Extract subject badges
    const subjectBadges = [];
    for (const subject of progress.subjects) {
      for (const level of subject.levels) {
        if (level.badge.earned) {
          subjectBadges.push({
            subject: subject.subjectId,
            level: level.level,
            stars: level.stars,
            earnedAt: level.badge.earnedAt,
            prestigePoints: level.prestigePoints
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        subjectBadges,
        genericBadges: progress.genericBadges,
        totalBadges: subjectBadges.length + progress.genericBadges.length
      }
    });

  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badges',
      error: error.message
    });
  }
};

/**
 * @desc    Get prestige breakdown
 * @route   GET /api/progress/prestige
 * @access  Private (Student)
 */
export const getPrestige = async (req, res) => {
  try {
    const progress = await StudentProgress.findOne({ studentId: req.user._id })
      .populate('subjects.subjectId', 'name code');

    if (!progress) {
      return res.json({
        success: true,
        data: {
          totalPrestige: 0,
          breakdown: []
        }
      });
    }

    // Calculate prestige breakdown
    const breakdown = [];
    for (const subject of progress.subjects) {
      const subjectPrestige = subject.levels.reduce((sum, l) => sum + l.prestigePoints, 0);
      
      breakdown.push({
        subject: subject.subjectId,
        totalPrestige: subjectPrestige,
        levels: subject.levels.map(l => ({
          level: l.level,
          stars: l.stars,
          prestigePoints: l.prestigePoints
        }))
      });
    }

    res.json({
      success: true,
      data: {
        totalPrestige: progress.totalPrestige,
        breakdown
      }
    });

  } catch (error) {
    console.error('Get prestige error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prestige data',
      error: error.message
    });
  }
};
