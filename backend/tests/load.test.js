/**
 * CampusGrid Exam Load Test
 * 
 * Tests 800 concurrent students taking exams:
 * - Starting exams
 * - Submitting answers
 * - Finishing exams
 * - Violation reporting
 * 
 * Usage: node load-test-exam.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Configuration
const CONCURRENT_STUDENTS = 800;
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
const TEST_DB_NAME = 'campusgrid_loadtest';

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Test metrics
const metrics = {
  examStarts: { success: 0, failed: 0, times: [] },
  answerSubmits: { success: 0, failed: 0, times: [] },
  examFinishes: { success: 0, failed: 0, times: [] },
  violations: { success: 0, failed: 0, times: [] },
  totalTime: 0
};

// Helper to measure time
const measureTime = async (fn) => {
  const start = Date.now();
  try {
    await fn();
    return Date.now() - start;
  } catch (error) {
    throw error;
  }
};

// Create test students
async function createTestStudents() {
  log('\n📝 Creating 800 test students...', 'cyan');
  
  const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    role: String,
    profile: mongoose.Schema.Types.Mixed
  }));
  
  const students = [];
  const batchSize = 100;
  
  for (let i = 0; i < CONCURRENT_STUDENTS; i += batchSize) {
    const batch = [];
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    for (let j = 0; j < batchSize && (i + j) < CONCURRENT_STUDENTS; j++) {
      const studentNum = i + j + 1;
      batch.push({
        email: `loadtest.student${studentNum}@test.com`,
        password: hashedPassword,
        name: `Load Test Student ${studentNum}`,
        role: 'student',
        profile: {
          studentId: `LOAD${String(studentNum).padStart(4, '0')}`,
          branch: 'Computer Science',
          year: 3
        }
      });
    }
    
    const created = await User.insertMany(batch);
    students.push(...created);
    
    process.stdout.write(`\r✓ Created ${Math.min(i + batchSize, CONCURRENT_STUDENTS)}/${CONCURRENT_STUDENTS} students`);
  }
  
  log('\n✓ All students created!', 'green');
  return students;
}

// Create test exam
async function createTestExam() {
  log('\n📋 Creating test exam...', 'cyan');
  
  const Subject = mongoose.model('Subject', new mongoose.Schema({
    name: String,
    description: String,
    isActive: Boolean
  }));
  
  const Question = mongoose.model('Question', new mongoose.Schema({
    subjectId: mongoose.Schema.Types.ObjectId,
    type: String,
    level: String,
    question: String,
    options: [String],
    correctAnswer: String,
    points: Number,
    isActive: Boolean
  }));
  
  // Create subject
  const subject = await Subject.create({
    name: 'Load Test Subject',
    description: 'Subject for load testing',
    isActive: true
  });
  
  // Create 10 questions
  const questions = [];
  for (let i = 1; i <= 10; i++) {
    questions.push({
      subjectId: subject._id,
      type: 'mcq',
      level: 'Beginner',
      question: `Load test question ${i}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      points: 10,
      isActive: true
    });
  }
  
  const createdQuestions = await Question.insertMany(questions);
  
  log('✓ Test exam created!', 'green');
  return { subject, questions: createdQuestions };
}

// Generate JWT token
function generateToken(userId, role) {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '24h' });
}

// Test exam start (800 concurrent)
async function testExamStarts(students, subjectId) {
  log('\n🚀 Testing 800 concurrent exam starts...', 'magenta');
  log('This simulates all students starting exam at the same time', 'yellow');
  
  const startTime = Date.now();
  const promises = students.map(async (student, index) => {
    const token = generateToken(student._id, 'student');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const requestStart = Date.now();
      const response = await axios.post(
        `${API_URL}/exams/general/start`,
        {
          subjectId: subjectId,
          level: 'Beginner'
        },
        { headers, timeout: 30000 }
      );
      
      const duration = Date.now() - requestStart;
      metrics.examStarts.times.push(duration);
      metrics.examStarts.success++;
      
      // Show progress every 50 students
      if ((index + 1) % 50 === 0) {
        process.stdout.write(`\r✓ ${index + 1}/${CONCURRENT_STUDENTS} exams started`);
      }
      
      return response.data.data.attemptId;
    } catch (error) {
      metrics.examStarts.failed++;
      return null;
    }
  });
  
  const attemptIds = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  log(`\n✓ Exam starts completed in ${totalTime}ms`, 'green');
  log(`  Success: ${metrics.examStarts.success}`, 'green');
  log(`  Failed: ${metrics.examStarts.failed}`, metrics.examStarts.failed > 0 ? 'red' : 'green');
  
  return attemptIds.filter(id => id !== null);
}

// Test answer submissions (800 students x 10 answers = 8000 requests)
async function testAnswerSubmissions(students, attemptIds, questions) {
  log('\n📝 Testing answer submissions (8000 total)...', 'magenta');
  log('Each student submits 10 answers', 'yellow');
  
  const startTime = Date.now();
  let totalSubmissions = 0;
  
  const promises = students.map(async (student, studentIndex) => {
    const attemptId = attemptIds[studentIndex];
    if (!attemptId) return;
    
    const token = generateToken(student._id, 'student');
    const headers = { Authorization: `Bearer ${token}` };
    
    // Submit 10 answers per student
    for (let i = 0; i < questions.length; i++) {
      try {
        const requestStart = Date.now();
        await axios.post(
          `${API_URL}/exams/submit`,
          {
            attemptId: attemptId,
            questionId: questions[i]._id,
            answer: 'Option A'
          },
          { headers, timeout: 10000 }
        );
        
        const duration = Date.now() - requestStart;
        metrics.answerSubmits.times.push(duration);
        metrics.answerSubmits.success++;
        totalSubmissions++;
        
        // Show progress every 400 submissions
        if (totalSubmissions % 400 === 0) {
          process.stdout.write(`\r✓ ${totalSubmissions}/8000 answers submitted`);
        }
      } catch (error) {
        metrics.answerSubmits.failed++;
      }
    }
  });
  
  await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  log(`\n✓ Answer submissions completed in ${totalTime}ms`, 'green');
  log(`  Success: ${metrics.answerSubmits.success}`, 'green');
  log(`  Failed: ${metrics.answerSubmits.failed}`, metrics.answerSubmits.failed > 0 ? 'red' : 'green');
}

// Test violations (simulate 100 students with violations)
async function testViolations(students, attemptIds) {
  log('\n⚠️  Testing violation reporting (100 violations)...', 'magenta');
  
  const startTime = Date.now();
  const violationTypes = ['tab_switch', 'mouse_leave', 'fullscreen_exit', 'inactivity'];
  
  // Only first 100 students report violations
  const promises = students.slice(0, 100).map(async (student, index) => {
    const attemptId = attemptIds[index];
    if (!attemptId) return;
    
    const token = generateToken(student._id, 'student');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const requestStart = Date.now();
      await axios.post(
        `${API_URL}/exams/violation`,
        {
          attemptId: attemptId,
          type: violationTypes[index % violationTypes.length]
        },
        { headers, timeout: 10000 }
      );
      
      const duration = Date.now() - requestStart;
      metrics.violations.times.push(duration);
      metrics.violations.success++;
      
      if ((index + 1) % 20 === 0) {
        process.stdout.write(`\r✓ ${index + 1}/100 violations reported`);
      }
    } catch (error) {
      metrics.violations.failed++;
    }
  });
  
  await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  log(`\n✓ Violations reported in ${totalTime}ms`, 'green');
  log(`  Success: ${metrics.violations.success}`, 'green');
  log(`  Failed: ${metrics.violations.failed}`, metrics.violations.failed > 0 ? 'red' : 'green');
}

// Test exam finishes (800 concurrent)
async function testExamFinishes(students, attemptIds) {
  log('\n🏁 Testing 800 concurrent exam finishes...', 'magenta');
  
  const startTime = Date.now();
  const promises = students.map(async (student, index) => {
    const attemptId = attemptIds[index];
    if (!attemptId) return;
    
    const token = generateToken(student._id, 'student');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const requestStart = Date.now();
      await axios.post(
        `${API_URL}/exams/finish`,
        { attemptId: attemptId },
        { headers, timeout: 30000 }
      );
      
      const duration = Date.now() - requestStart;
      metrics.examFinishes.times.push(duration);
      metrics.examFinishes.success++;
      
      if ((index + 1) % 50 === 0) {
        process.stdout.write(`\r✓ ${index + 1}/${CONCURRENT_STUDENTS} exams finished`);
      }
    } catch (error) {
      metrics.examFinishes.failed++;
    }
  });
  
  await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  log(`\n✓ Exam finishes completed in ${totalTime}ms`, 'green');
  log(`  Success: ${metrics.examFinishes.success}`, 'green');
  log(`  Failed: ${metrics.examFinishes.failed}`, metrics.examFinishes.failed > 0 ? 'red' : 'green');
}

// Calculate statistics
function calculateStats(times) {
  if (times.length === 0) return { min: 0, max: 0, avg: 0, p95: 0, p99: 0 };
  
  const sorted = times.sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(sum / sorted.length),
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

// Print detailed results
function printResults() {
  log('\n' + '='.repeat(60), 'blue');
  log('📊 LOAD TEST RESULTS - 800 CONCURRENT STUDENTS', 'blue');
  log('='.repeat(60), 'blue');
  
  // Exam Starts
  log('\n🚀 Exam Starts:', 'cyan');
  log(`  Total Requests: ${CONCURRENT_STUDENTS}`, 'white');
  log(`  Success: ${metrics.examStarts.success} (${((metrics.examStarts.success/CONCURRENT_STUDENTS)*100).toFixed(1)}%)`, 'green');
  log(`  Failed: ${metrics.examStarts.failed} (${((metrics.examStarts.failed/CONCURRENT_STUDENTS)*100).toFixed(1)}%)`, metrics.examStarts.failed > 0 ? 'red' : 'green');
  
  const startStats = calculateStats(metrics.examStarts.times);
  log(`  Response Times:`, 'white');
  log(`    Min: ${startStats.min}ms`, 'white');
  log(`    Avg: ${startStats.avg}ms`, 'white');
  log(`    P95: ${startStats.p95}ms`, 'white');
  log(`    P99: ${startStats.p99}ms`, 'white');
  log(`    Max: ${startStats.max}ms`, 'white');
  
  // Answer Submissions
  log('\n📝 Answer Submissions:', 'cyan');
  log(`  Total Requests: ${CONCURRENT_STUDENTS * 10} (800 students × 10 answers)`, 'white');
  log(`  Success: ${metrics.answerSubmits.success} (${((metrics.answerSubmits.success/(CONCURRENT_STUDENTS*10))*100).toFixed(1)}%)`, 'green');
  log(`  Failed: ${metrics.answerSubmits.failed} (${((metrics.answerSubmits.failed/(CONCURRENT_STUDENTS*10))*100).toFixed(1)}%)`, metrics.answerSubmits.failed > 0 ? 'red' : 'green');
  
  const submitStats = calculateStats(metrics.answerSubmits.times);
  log(`  Response Times:`, 'white');
  log(`    Min: ${submitStats.min}ms`, 'white');
  log(`    Avg: ${submitStats.avg}ms`, 'white');
  log(`    P95: ${submitStats.p95}ms`, 'white');
  log(`    P99: ${submitStats.p99}ms`, 'white');
  log(`    Max: ${submitStats.max}ms`, 'white');
  
  // Violations
  log('\n⚠️  Violation Reports:', 'cyan');
  log(`  Total Requests: 100`, 'white');
  log(`  Success: ${metrics.violations.success} (${((metrics.violations.success/100)*100).toFixed(1)}%)`, 'green');
  log(`  Failed: ${metrics.violations.failed} (${((metrics.violations.failed/100)*100).toFixed(1)}%)`, metrics.violations.failed > 0 ? 'red' : 'green');
  
  const violationStats = calculateStats(metrics.violations.times);
  log(`  Response Times:`, 'white');
  log(`    Min: ${violationStats.min}ms`, 'white');
  log(`    Avg: ${violationStats.avg}ms`, 'white');
  log(`    Max: ${violationStats.max}ms`, 'white');
  
  // Exam Finishes
  log('\n🏁 Exam Finishes:', 'cyan');
  log(`  Total Requests: ${CONCURRENT_STUDENTS}`, 'white');
  log(`  Success: ${metrics.examFinishes.success} (${((metrics.examFinishes.success/CONCURRENT_STUDENTS)*100).toFixed(1)}%)`, 'green');
  log(`  Failed: ${metrics.examFinishes.failed} (${((metrics.examFinishes.failed/CONCURRENT_STUDENTS)*100).toFixed(1)}%)`, metrics.examFinishes.failed > 0 ? 'red' : 'green');
  
  const finishStats = calculateStats(metrics.examFinishes.times);
  log(`  Response Times:`, 'white');
  log(`    Min: ${finishStats.min}ms`, 'white');
  log(`    Avg: ${finishStats.avg}ms`, 'white');
  log(`    P95: ${finishStats.p95}ms`, 'white');
  log(`    P99: ${finishStats.p99}ms`, 'white');
  log(`    Max: ${finishStats.max}ms`, 'white');
  
  // Overall Summary
  const totalRequests = CONCURRENT_STUDENTS + (CONCURRENT_STUDENTS * 10) + 100 + CONCURRENT_STUDENTS;
  const totalSuccess = metrics.examStarts.success + metrics.answerSubmits.success + metrics.violations.success + metrics.examFinishes.success;
  const totalFailed = metrics.examStarts.failed + metrics.answerSubmits.failed + metrics.violations.failed + metrics.examFinishes.failed;
  
  log('\n' + '='.repeat(60), 'blue');
  log('📈 OVERALL SUMMARY', 'blue');
  log('='.repeat(60), 'blue');
  log(`  Total Requests: ${totalRequests}`, 'white');
  log(`  Total Success: ${totalSuccess} (${((totalSuccess/totalRequests)*100).toFixed(1)}%)`, 'green');
  log(`  Total Failed: ${totalFailed} (${((totalFailed/totalRequests)*100).toFixed(1)}%)`, totalFailed > 0 ? 'red' : 'green');
  log(`  Total Time: ${metrics.totalTime}ms (${(metrics.totalTime/1000).toFixed(1)}s)`, 'cyan');
  
  // Pass/Fail
  log('\n' + '='.repeat(60), 'blue');
  const successRate = (totalSuccess / totalRequests) * 100;
  if (successRate >= 95) {
    log('✅ LOAD TEST PASSED!', 'green');
    log(`   Success rate: ${successRate.toFixed(1)}% (>= 95% required)`, 'green');
  } else {
    log('❌ LOAD TEST FAILED!', 'red');
    log(`   Success rate: ${successRate.toFixed(1)}% (< 95% required)`, 'red');
  }
  log('='.repeat(60) + '\n', 'blue');
}

// Main test function
async function runLoadTest() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 CAMPUSGRID EXAM LOAD TEST', 'blue');
  log('='.repeat(60), 'blue');
  log(`  Concurrent Students: ${CONCURRENT_STUDENTS}`, 'cyan');
  log(`  Total Requests: ~${CONCURRENT_STUDENTS * 12 + 100}`, 'cyan');
  log(`  API URL: ${API_URL}`, 'cyan');
  log('='.repeat(60) + '\n', 'blue');
  
  const overallStart = Date.now();
  
  try {
    // Connect to test database
    log('📡 Connecting to test database...', 'cyan');
    const testDbUri = process.env.MONGODB_URI.replace(/\/[^\/]*$/, `/${TEST_DB_NAME}`);
    await mongoose.connect(testDbUri);
    log('✓ Connected to test database\n', 'green');
    
    // Clean database
    log('🧹 Cleaning test database...', 'cyan');
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    log('✓ Database cleaned\n', 'green');
    
    // Create test data
    const students = await createTestStudents();
    const { subject, questions } = await createTestExam();
    
    // Run load tests
    const attemptIds = await testExamStarts(students, subject._id);
    await testAnswerSubmissions(students, attemptIds, questions);
    await testViolations(students, attemptIds);
    await testExamFinishes(students, attemptIds);
    
    metrics.totalTime = Date.now() - overallStart;
    
    // Print results
    printResults();
    
    // Cleanup
    log('🧹 Cleaning up test data...', 'cyan');
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    log('✓ Cleanup complete\n', 'green');
    
  } catch (error) {
    log(`\n❌ Load test failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log('📡 Database connection closed\n', 'cyan');
    
    // Exit with appropriate code
    const totalSuccess = metrics.examStarts.success + metrics.answerSubmits.success + metrics.violations.success + metrics.examFinishes.success;
    const totalRequests = CONCURRENT_STUDENTS + (CONCURRENT_STUDENTS * 10) + 100 + CONCURRENT_STUDENTS;
    const successRate = (totalSuccess / totalRequests) * 100;
    
    process.exit(successRate >= 95 ? 0 : 1);
  }
}

// Check if server is running
log('\n🔍 Checking if server is running...', 'cyan');
axios.get(`${API_URL.replace('/api', '')}/api/health`)
  .then(() => {
    log('✓ Server is running\n', 'green');
    runLoadTest();
  })
  .catch(() => {
    log('❌ Server is not running!', 'red');
    log('Please start the server first: npm run dev\n', 'yellow');
    process.exit(1);
  });
