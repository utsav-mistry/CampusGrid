import mongoose from 'mongoose';

const examAttemptSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: false // null for general exams, required for drive exams
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  level: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['strict', 'lenient'],
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  timeTaken: Number, // in seconds
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: Number,
    codeResults: {
      passedTests: Number,
      totalTests: Number,
      testResults: [mongoose.Schema.Types.Mixed]
    }
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  scorePercentage: {
    type: Number,
    default: 0
  },
  violations: [{
    type: {
      type: String,
      enum: ['tab_switch', 'fullscreen_exit', 'window_blur']
    },
    timestamp: Date,
    count: {
      type: Number,
      default: 1
    }
  }],
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'auto_submitted', 'banned'],
    default: 'in_progress'
  }
}, {
  timestamps: true
});

// Index for faster queries
examAttemptSchema.index({ studentId: 1, examId: 1 });
examAttemptSchema.index({ status: 1 });

const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);

export default ExamAttempt;
