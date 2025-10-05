import Exam from '../models/Exam.js';
import ExamAttempt from '../models/ExamAttempt.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { executeCode, validateCode } from '../utils/codeExecutor.js';
import { updateStudentProgress } from '../utils/progressCalculator.js';

/**
 * @desc    Get available subjects and levels for general exams
 * @route   GET /api/exams/general/subjects
 * @access  Private (Student)
 */
export const getGeneralExamSubjects = async (req, res) => {
  try {
    const Subject = (await import('../models/Subject.js')).default;
    
    // Get all active subjects
    const subjects = await Subject.find({ isActive: true });
    
    // Available levels
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
    
    res.json({
      success: true,
      data: {
        subjects,
        levels
      }
    });

  } catch (error) {
    console.error('Get general exam subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
};

/**
 * @desc    Get available exams for student (recruitment drives only)
 * @route   GET /api/exams
 * @access  Private (Student)
 */
export const getAvailableExams = async (req, res) => {
  try {
    const now = new Date();
    const user = await User.findById(req.user._id);

    // Get only recruitment drive exams (not auto-generated general exams)
    const exams = await Exam.find({
      isActive: true,
      examType: 'drive',
      availableFrom: { $lte: now },
      availableTo: { $gte: now }
    })
      .populate('subjectId', 'name code')
      .select('-questions'); // Don't send questions in list

    // Filter exams based on university email requirement
    const availableExams = exams.map(exam => {
      const examObj = exam.toObject();
      
      // Check if user can take this exam
      if (exam.requiresUniversityEmail) {
        examObj.canTake = user.isUniversityEmailVerified;
        examObj.requiresUniversityEmail = true;
        if (!user.isUniversityEmailVerified) {
          examObj.message = 'Requires verified university email (@mail.ljku.edu.in)';
        }
      } else {
        examObj.canTake = true;
        examObj.requiresUniversityEmail = false;
      }

      return examObj;
    });

    res.json({
      success: true,
      count: availableExams.length,
      data: availableExams
    });

  } catch (error) {
    console.error('Get available exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams',
      error: error.message
    });
  }
};

/**
 * @desc    Get exam details (without answers)
 * @route   GET /api/exams/:id
 * @access  Private (Student)
 */
export const getExamDetails = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('subjectId', 'name code')
      .populate({
        path: 'questions',
        select: '-correctAnswer -testCases' // Hide answers
      });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if exam requires university email
    const user = await User.findById(req.user._id);
    if (exam.requiresUniversityEmail && !user.isUniversityEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'This exam requires a verified university email (@mail.ljku.edu.in)',
        requiresUniversityEmail: true
      });
    }

    res.json({
      success: true,
      data: exam
    });

  } catch (error) {
    console.error('Get exam details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam details',
      error: error.message
    });
  }
};

/**
 * @desc    Start general exam (auto-generated with random questions)
 * @route   POST /api/exams/general/start
 * @access  Private (Student)
 */
export const startGeneralExam = async (req, res) => {
  try {
    const { subjectId, level, questionCount = 10 } = req.body;

    if (!subjectId || !level) {
      return res.status(400).json({
        success: false,
        message: 'Subject and level are required'
      });
    }

    // Validate level
    const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level'
      });
    }

    // Check for existing in-progress general exam
    const existingAttempt = await ExamAttempt.findOne({
      studentId: req.user._id,
      subjectId,
      level,
      status: 'in_progress'
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You already have an in-progress exam for this subject and level',
        attemptId: existingAttempt._id
      });
    }

    // Get random questions from database
    const questions = await Question.aggregate([
      {
        $match: {
          subjectId: subjectId,
          level: level,
          isPublic: true
        }
      },
      { $sample: { size: parseInt(questionCount) } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions available for this subject and level'
      });
    }

    // Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + q.points, 0);

    // Create exam attempt (no exam document needed for general exams)
    const attempt = await ExamAttempt.create({
      examId: null, // No exam document for general exams
      studentId: req.user._id,
      subjectId,
      level,
      mode: 'lenient', // General exams are always lenient
      startTime: new Date(),
      answers: [],
      violations: [],
      status: 'in_progress'
    });

    // Return questions without answers
    const questionsWithoutAnswers = questions.map(q => ({
      _id: q._id,
      type: q.type,
      question: q.question,
      options: q.options,
      codeTemplate: q.codeTemplate,
      language: q.language,
      points: q.points
    }));

    res.json({
      success: true,
      message: 'General exam started successfully',
      data: {
        attemptId: attempt._id,
        subjectId,
        level,
        duration: 60, // Default 60 minutes for general exams
        mode: 'lenient',
        totalMarks,
        questions: questionsWithoutAnswers,
        startTime: attempt.startTime,
        isGeneralExam: true
      }
    });

  } catch (error) {
    console.error('Start general exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start general exam',
      error: error.message
    });
  }
};

/**
 * @desc    Start recruitment drive exam
 * @route   POST /api/exams/:id/start
 * @access  Private (Student)
 */
export const startExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if exam requires university email
    const user = await User.findById(req.user._id);
    if (exam.requiresUniversityEmail && !user.isUniversityEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'This exam requires a verified university email. Please link and verify your university email first.',
        requiresUniversityEmail: true
      });
    }

    // Check if exam is available
    const now = new Date();
    if (now < exam.availableFrom || now > exam.availableTo) {
      return res.status(400).json({
        success: false,
        message: 'Exam is not available at this time'
      });
    }

    // Check for existing in-progress attempt
    const existingAttempt = await ExamAttempt.findOne({
      examId: exam._id,
      studentId: req.user._id,
      status: 'in_progress'
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You already have an in-progress attempt for this exam',
        attemptId: existingAttempt._id
      });
    }

    // Create new exam attempt
    const attempt = await ExamAttempt.create({
      examId: exam._id,
      studentId: req.user._id,
      subjectId: exam.subjectId,
      level: exam.level,
      mode: exam.mode,
      startTime: new Date(),
      answers: [],
      violations: [],
      status: 'in_progress'
    });

    // Return exam with questions (but hide answers)
    const questionsWithoutAnswers = exam.questions.map(q => ({
      _id: q._id,
      type: q.type,
      question: q.question,
      options: q.options,
      codeTemplate: q.codeTemplate,
      language: q.language,
      points: q.points
    }));

    res.json({
      success: true,
      message: 'Exam started successfully',
      data: {
        attemptId: attempt._id,
        examId: exam._id,
        title: exam.title,
        duration: exam.duration,
        mode: exam.mode,
        totalMarks: exam.totalMarks,
        questions: questionsWithoutAnswers,
        startTime: attempt.startTime
      }
    });

  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start exam',
      error: error.message
    });
  }
};

/**
 * @desc    Submit answer for a question
 * @route   POST /api/exams/:id/submit
 * @access  Private (Student)
 */
export const submitAnswer = async (req, res) => {
  try {
    const { attemptId, questionId, answer } = req.body;

    // Get attempt
    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      studentId: req.user._id,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Exam attempt not found or already completed'
      });
    }

    // Get question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if answer already exists
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    let isCorrect = false;
    let pointsEarned = 0;
    let codeResults = null;

    // Evaluate answer based on question type
    if (question.type === 'mcq') {
      isCorrect = answer === question.correctAnswer;
      pointsEarned = isCorrect ? question.points : 0;
    } else if (question.type === 'code') {
      // Enhanced validation with language-specific checks
      const validation = validateCode(answer, question.language);
      if (!validation.valid) {
        // Log security violations
        if (validation.securityViolation) {
          console.warn(`[SECURITY] Code validation failed for user ${req.user._id}: ${validation.error}`);
        }
        
        return res.status(400).json({
          success: false,
          message: validation.error,
          securityViolation: validation.securityViolation
        });
      }

      // Execute code with comprehensive error handling
      const execution = await executeCode(answer, question.testCases, question.language);
      
      if (!execution.success) {
        return res.status(400).json({
          success: false,
          message: 'Code execution failed',
          error: execution.error
        });
      }
      
      codeResults = execution;
      
      // Calculate points based on test cases passed
      pointsEarned = (execution.passedCount / execution.totalCount) * question.points;
      isCorrect = execution.passedCount === execution.totalCount;
    }

    // Update or add answer
    const answerData = {
      questionId,
      answer,
      isCorrect,
      pointsEarned,
      codeResults
    };

    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = answerData;
    } else {
      attempt.answers.push(answerData);
    }

    await attempt.save();

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        isCorrect,
        pointsEarned,
        codeResults: codeResults ? {
          passedCount: codeResults.passedCount,
          totalCount: codeResults.totalCount,
          results: codeResults.results.filter(r => !r.input.includes('Hidden'))
        } : null
      }
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message
    });
  }
};

/**
 * @desc    Finish exam
 * @route   POST /api/exams/:id/finish
 * @access  Private (Student)
 */
export const finishExam = async (req, res) => {
  try {
    const { attemptId } = req.body;

    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      studentId: req.user._id,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Exam attempt not found or already completed'
      });
    }

    // Calculate final score
    const totalScore = attempt.answers.reduce((sum, a) => sum + a.pointsEarned, 0);
    
    // Get total marks (from exam document or calculate from answers)
    let totalMarks;
    let passingPercentage = 60; // Default
    
    if (attempt.examId) {
      // Drive exam - get from exam document
      const exam = await Exam.findById(attempt.examId);
      totalMarks = exam.totalMarks;
      passingPercentage = exam.passingPercentage;
    } else {
      // General exam - calculate from questions
      const questionIds = attempt.answers.map(a => a.questionId);
      const questions = await Question.find({ _id: { $in: questionIds } });
      totalMarks = questions.reduce((sum, q) => sum + q.points, 0);
    }
    
    const scorePercentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

    // Update attempt
    attempt.endTime = new Date();
    attempt.timeTaken = Math.floor((attempt.endTime - attempt.startTime) / 1000);
    attempt.totalScore = totalScore;
    attempt.scorePercentage = scorePercentage;
    attempt.status = 'completed';
    await attempt.save();

    // Update student progress
    await updateStudentProgress(req.user._id, attempt);

    res.json({
      success: true,
      message: 'Exam completed successfully',
      data: {
        totalScore,
        scorePercentage,
        timeTaken: attempt.timeTaken,
        passed: scorePercentage >= passingPercentage
      }
    });

  } catch (error) {
    console.error('Finish exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to finish exam',
      error: error.message
    });
  }
};

/**
 * @desc    Report violation during exam
 * @route   POST /api/exams/:id/violation
 * @access  Private (Student)
 */
export const reportViolation = async (req, res) => {
  try {
    const { attemptId, violationType } = req.body;

    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      studentId: req.user._id,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Exam attempt not found'
      });
    }

    // Check existing violations
    const existingViolation = attempt.violations.find(v => v.type === violationType);
    
    if (existingViolation) {
      existingViolation.count += 1;
      existingViolation.timestamp = new Date();
    } else {
      attempt.violations.push({
        type: violationType,
        timestamp: new Date(),
        count: 1
      });
    }

    // Determine action based on mode
    let banned = false;
    let warning = false;

    if (attempt.mode === 'strict') {
      // Strict mode: immediate ban
      attempt.status = 'banned';
      banned = true;
    } else {
      // Lenient mode: warning then ban
      const totalViolations = attempt.violations.reduce((sum, v) => sum + v.count, 0);
      if (totalViolations === 1) {
        warning = true;
      } else {
        attempt.status = 'banned';
        banned = true;
      }
    }

    await attempt.save();

    res.json({
      success: true,
      data: {
        banned,
        warning,
        violationCount: attempt.violations.reduce((sum, v) => sum + v.count, 0)
      }
    });

  } catch (error) {
    console.error('Report violation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report violation',
      error: error.message
    });
  }
};
