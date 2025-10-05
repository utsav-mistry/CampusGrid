import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { requireRecruiter } from '../middleware/rbac.js';
import Exam from '../models/Exam.js';
import ExamAttempt from '../models/ExamAttempt.js';
import Question from '../models/Question.js';

const router = express.Router();

// All routes require authentication and recruiter role
router.use(protect);
router.use(authorize('recruiter'));
router.use(requireRecruiter); // Additional RBAC check

// ============================================================================
// DRIVE MANAGEMENT
// ============================================================================

// Get all drives created by this recruiter
router.get('/drives', async (req, res) => {
  try {
    const drives = await Exam.find({ createdBy: req.user.id })
      .populate('questions', 'question type level points')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: drives });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get drive details
router.get('/drives/:id', async (req, res) => {
  try {
    const drive = await Exam.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    }).populate('questions');

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new drive
router.post('/drives', async (req, res) => {
  try {
    const drive = await Exam.create({
      ...req.body,
      type: 'recruitment',
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update drive
router.put('/drives/:id', async (req, res) => {
  try {
    const drive = await Exam.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete drive
router.delete('/drives/:id', async (req, res) => {
  try {
    const drive = await Exam.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    res.json({ success: true, message: 'Drive deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// APPLICANT MANAGEMENT
// ============================================================================

// Get all applicants for a drive
router.get('/drives/:id/applicants', async (req, res) => {
  try {
    // Verify drive belongs to recruiter
    const drive = await Exam.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    const applicants = await ExamAttempt.find({
      examId: req.params.id,
      status: 'completed'
    })
      .populate('studentId', 'name email universityEmail')
      .sort({ scorePercentage: -1 });

    res.json({ success: true, data: applicants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get applicant details
router.get('/drives/:driveId/applicants/:applicantId', async (req, res) => {
  try {
    // Verify drive belongs to recruiter
    const drive = await Exam.findOne({
      _id: req.params.driveId,
      createdBy: req.user.id
    });

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    const applicant = await ExamAttempt.findOne({
      _id: req.params.applicantId,
      examId: req.params.driveId
    })
      .populate('studentId', 'name email universityEmail')
      .populate('answers.questionId', 'question type');

    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Applicant not found' });
    }

    res.json({ success: true, data: applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get drive statistics
router.get('/drives/:id/stats', async (req, res) => {
  try {
    // Verify drive belongs to recruiter
    const drive = await Exam.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Drive not found' });
    }

    const applicants = await ExamAttempt.find({
      examId: req.params.id,
      status: 'completed'
    });

    const stats = {
      total: applicants.length,
      passed: applicants.filter(a => a.scorePercentage >= 60).length,
      failed: applicants.filter(a => a.scorePercentage < 60).length,
      avgScore: applicants.length > 0
        ? (applicants.reduce((sum, a) => sum + a.scorePercentage, 0) / applicants.length).toFixed(1)
        : 0,
      highestScore: applicants.length > 0
        ? Math.max(...applicants.map(a => a.scorePercentage))
        : 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
