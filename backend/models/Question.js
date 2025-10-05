import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Master'],
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'code'],
    required: true
  },
  question: {
    type: String,
    required: [true, 'Question text is required']
  },
  
  // For MCQ questions
  options: [{
    type: String
  }],
  correctAnswer: String, // For MCQ: index or text
  
  // For Code questions
  codeTemplate: String,
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp'],
    default: 'javascript',
    lowercase: true
  },
  allowedLanguages: [{
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp']
  }], // For multi-language questions (student can choose)
  testCases: [{
    input: String, // Input as string (can be JSON)
    expectedOutput: String, // Expected console output as string
    isHidden: {
      type: Boolean,
      default: false
    },
    explanation: String // Optional explanation for the test case
  }],
  
  points: {
    type: Number,
    default: 1,
    min: 1
  },
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validation: MCQ must have options and correctAnswer
questionSchema.pre('save', function(next) {
  if (this.type === 'mcq') {
    if (!this.options || this.options.length < 2) {
      return next(new Error('MCQ must have at least 2 options'));
    }
    if (!this.correctAnswer) {
      return next(new Error('MCQ must have a correct answer'));
    }
  }
  
  if (this.type === 'code') {
    if (!this.testCases || this.testCases.length === 0) {
      return next(new Error('Code question must have at least 1 test case'));
    }
  }
  
  next();
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
