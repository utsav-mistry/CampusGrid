import mongoose from 'mongoose';

const studentProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subjects: [{
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject'
    },
    levels: [{
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Master']
      },
      badge: {
        earned: {
          type: Boolean,
          default: false
        },
        earnedAt: Date
      },
      stars: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
      },
      examsCompleted: {
        type: Number,
        default: 0
      },
      averageScore: {
        type: Number,
        default: 0
      },
      prestigePoints: {
        type: Number,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  totalPrestige: {
    type: Number,
    default: 0
  },
  genericBadges: [{
    badgeId: String,
    name: String,
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    earnedAt: Date
  }],
  stats: {
    totalExams: {
      type: Number,
      default: 0
    },
    totalViolations: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    lastExamDate: Date
  }
}, {
  timestamps: true
});

const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);

export default StudentProgress;
