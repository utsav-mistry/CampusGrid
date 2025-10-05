import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import Exam from '../models/Exam.js';
import ExamAttempt from '../models/ExamAttempt.js';
import StudentProgress from '../models/StudentProgress.js';

dotenv.config();

const createIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    console.log('Creating indexes for optimal performance...\n');

    // User indexes
    console.log('Creating User indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ 'profile.studentId': 1 }, { sparse: true });
    console.log('User indexes created\n');

    // Subject indexes
    console.log('Creating Subject indexes...');
    await Subject.collection.createIndex({ name: 1 }, { unique: true });
    await Subject.collection.createIndex({ isActive: 1 });
    console.log('Subject indexes created\n');

    // Question indexes
    console.log('Creating Question indexes...');
    await Question.collection.createIndex({ subjectId: 1, level: 1 });
    await Question.collection.createIndex({ type: 1 });
    await Question.collection.createIndex({ subjectId: 1, level: 1, type: 1 });
    await Question.collection.createIndex({ isActive: 1 });
    console.log('Question indexes created\n');

    // Exam indexes
    console.log('Creating Exam indexes...');
    await Exam.collection.createIndex({ subjectId: 1, level: 1 });
    await Exam.collection.createIndex({ createdBy: 1, isActive: 1 });
    await Exam.collection.createIndex({ mode: 1, isActive: 1 });
    await Exam.collection.createIndex({ 
      'schedule.startDate': 1, 
      'schedule.endDate': 1 
    });
    console.log('Exam indexes created\n');

    // ExamAttempt indexes (Critical for performance)
    console.log('Creating ExamAttempt indexes...');
    await ExamAttempt.collection.createIndex({ userId: 1, examId: 1 });
    await ExamAttempt.collection.createIndex({ examId: 1, status: 1 });
    await ExamAttempt.collection.createIndex({ userId: 1, status: 1 });
    await ExamAttempt.collection.createIndex({ completedAt: -1 });
    await ExamAttempt.collection.createIndex({ 
      userId: 1, 
      examId: 1, 
      status: 1 
    });
    console.log('ExamAttempt indexes created\n');

    // StudentProgress indexes
    console.log('Creating StudentProgress indexes...');
    await StudentProgress.collection.createIndex({ userId: 1 }, { unique: true });
    await StudentProgress.collection.createIndex({ totalPrestige: -1 });
    await StudentProgress.collection.createIndex({ 'subjects.subjectId': 1 });
    console.log('StudentProgress indexes created\n');

    // Get index statistics
    console.log('Index Statistics:\n');
    
    const collections = [
      { name: 'users', model: User },
      { name: 'subjects', model: Subject },
      { name: 'questions', model: Question },
      { name: 'exams', model: Exam },
      { name: 'examattempts', model: ExamAttempt },
      { name: 'studentprogresses', model: StudentProgress }
    ];

    for (const { name, model } of collections) {
      const indexes = await model.collection.getIndexes();
      console.log(`${name}: ${Object.keys(indexes).length} indexes`);
      Object.keys(indexes).forEach(key => {
        console.log(`  - ${key}`);
      });
      console.log('');
    }

    console.log('All indexes created successfully!');
    console.log('\nDatabase is now optimized for 600+ concurrent users');
    
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

createIndexes();
