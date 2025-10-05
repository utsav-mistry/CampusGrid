import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { requireAdmin, auditAdminAction } from '../middleware/rbac.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import StudentProgress from '../models/StudentProgress.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));
router.use(requireAdmin); // Additional RBAC check

// ============================================================================
// DASHBOARD & STATS
// ============================================================================

router.get('/stats', async (req, res) => {
  try {
    const [studentCount, subjectCount, questionCount, progressData] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Subject.countDocuments(),
      Question.countDocuments(),
      StudentProgress.find().select('stats')
    ]);

    const totalExams = progressData.reduce((sum, p) => sum + (p.stats?.totalExams || 0), 0);
    const avgScore = progressData.length > 0
      ? progressData.reduce((sum, p) => sum + (p.stats?.averageScore || 0), 0) / progressData.length
      : 0;

    res.json({
      success: true,
      data: {
        totalStudents: studentCount,
        totalSubjects: subjectCount,
        totalQuestions: questionCount,
        totalExams,
        avgScore: avgScore.toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// SUBJECT MANAGEMENT
// ============================================================================

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create subject
router.post('/subjects', auditAdminAction('CREATE_SUBJECT'), async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update subject
router.put('/subjects/:id', auditAdminAction('UPDATE_SUBJECT'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete subject
router.delete('/subjects/:id', auditAdminAction('DELETE_SUBJECT'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// QUESTION MANAGEMENT
// ============================================================================

// Get all questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create question
router.post('/questions', auditAdminAction('CREATE_QUESTION'), async (req, res) => {
  try {
    const question = await Question.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update question
router.put('/questions/:id', auditAdminAction('UPDATE_QUESTION'), async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete question
router.delete('/questions/:id', auditAdminAction('DELETE_QUESTION'), async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ============================================================================
// STUDENT MANAGEMENT
// ============================================================================

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Enrich with progress data
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const progress = await StudentProgress.findOne({ studentId: student._id });
        return {
          ...student.toObject(),
          totalPrestige: progress?.totalPrestige || 0,
          totalExams: progress?.stats?.totalExams || 0,
          lastActive: progress?.stats?.lastExamDate
        };
      })
    );

    res.json({ success: true, data: enrichedStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student details
router.get('/students/:id', async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const progress = await StudentProgress.findOne({ studentId: student._id })
      .populate('subjects.subjectId', 'name');

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        progress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
