/**
 * CampusGrid System Test Script
 * 
 * This script:
 * 1. Creates a test database
 * 2. Seeds sample data
 * 3. Creates test users (admin, student, recruiter)
 * 4. Tests all major endpoints
 * 5. Cleans up test data
 * 
 * Usage: node test-system.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Test configuration
const TEST_DB_NAME = 'campusgrid_test';
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Test data
const testUsers = {
  admin: {
    email: 'test.admin@campusgrid.test',
    password: 'TestAdmin@123',
    name: 'Test Admin',
    role: 'admin'
  },
  student: {
    email: 'test.student@campusgrid.test',
    password: 'TestStudent@123',
    name: 'Test Student',
    role: 'student',
    profile: {
      studentId: 'TEST001',
      branch: 'Computer Science',
      year: 3
    }
  },
  recruiter: {
    email: 'test.recruiter@campusgrid.test',
    password: 'TestRecruiter@123',
    name: 'Test Recruiter',
    role: 'recruiter',
    profile: {
      companyName: 'Test Corp',
      designation: 'HR Manager',
      phone: '+91 9876543210'
    }
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const success = (message) => log(`✓ ${message}`, 'green');
const error = (message) => log(`✗ ${message}`, 'red');
const info = (message) => log(`ℹ ${message}`, 'cyan');
const warn = (message) => log(`⚠ ${message}`, 'yellow');

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

const recordTest = (name, passed, message = '') => {
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
    success(`${name} ${message}`);
  } else {
    testResults.failed++;
    error(`${name} ${message}`);
  }
};

// Main test function
async function runTests() {
  log('\n=== CampusGrid System Test ===\n', 'blue');
  
  try {
    // Step 1: Connect to test database
    info('Step 1: Connecting to test database...');
    const testDbUri = process.env.MONGODB_URI.replace(/\/[^\/]*$/, `/${TEST_DB_NAME}`);
    await mongoose.connect(testDbUri);
    success('Connected to test database');
    
    // Step 2: Clean existing test data
    info('\nStep 2: Cleaning existing test data...');
    await cleanDatabase();
    success('Test database cleaned');
    
    // Step 3: Create indexes
    info('\nStep 3: Creating database indexes...');
    await createIndexes();
    success('Database indexes created');
    
    // Step 4: Seed test data
    info('\nStep 4: Seeding test data...');
    await seedTestData();
    success('Test data seeded');
    
    // Step 5: Create test users
    info('\nStep 5: Creating test users...');
    const users = await createTestUsers();
    success('Test users created');
    
    // Step 6: Test authentication
    info('\nStep 6: Testing authentication...');
    const tokens = await testAuthentication(users);
    
    // Step 7: Test student endpoints
    info('\nStep 7: Testing student endpoints...');
    await testStudentEndpoints(tokens.student);
    
    // Step 8: Test admin endpoints
    info('\nStep 8: Testing admin endpoints...');
    await testAdminEndpoints(tokens.admin);
    
    // Step 9: Test recruiter endpoints
    info('\nStep 9: Testing recruiter endpoints...');
    await testRecruiterEndpoints(tokens.recruiter);
    
    // Step 10: Test concurrent requests
    info('\nStep 10: Testing concurrent requests...');
    await testConcurrency(tokens.student);
    
    // Step 11: Clean up
    info('\nStep 11: Cleaning up test data...');
    await cleanDatabase();
    success('Test data cleaned up');
    
    // Print results
    printResults();
    
  } catch (err) {
    error(`\nTest failed with error: ${err.message}`);
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    log('\nDatabase connection closed', 'cyan');
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

// Clean database
async function cleanDatabase() {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

// Create indexes
async function createIndexes() {
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ role: 1 });
}

// Seed test data
async function seedTestData() {
  // Import models
  const Subject = mongoose.model('Subject', new mongoose.Schema({
    name: String,
    description: String,
    isActive: { type: Boolean, default: true }
  }));
  
  // Create test subjects
  const subjects = await Subject.create([
    { name: 'JavaScript', description: 'JavaScript programming', isActive: true },
    { name: 'Python', description: 'Python programming', isActive: true },
    { name: 'Data Structures', description: 'DSA concepts', isActive: true }
  ]);
  
  recordTest('Seed Data', true, `- Created ${subjects.length} subjects`);
}

// Create test users
async function createTestUsers() {
  const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    role: String,
    profile: mongoose.Schema.Types.Mixed
  }));
  
  const users = {};
  
  for (const [role, userData] of Object.entries(testUsers)) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });
    users[role] = user;
    recordTest('Create User', true, `- ${role}: ${userData.email}`);
  }
  
  return users;
}

// Test authentication
async function testAuthentication(users) {
  const tokens = {};
  
  for (const [role, userData] of Object.entries(testUsers)) {
    try {
      // Generate token
      const token = jwt.sign(
        { id: users[role]._id, role: users[role].role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      tokens[role] = token;
      recordTest('Authentication', true, `- ${role} token generated`);
    } catch (err) {
      recordTest('Authentication', false, `- ${role} failed: ${err.message}`);
    }
  }
  
  return tokens;
}

// Test student endpoints
async function testStudentEndpoints(token) {
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test get available exams
  try {
    const response = await axios.get(`${API_URL}/exams`, { headers });
    recordTest('Student - Get Exams', response.status === 200, `- Status: ${response.status}`);
  } catch (err) {
    recordTest('Student - Get Exams', false, `- Error: ${err.message}`);
  }
  
  // Test get progress
  try {
    const response = await axios.get(`${API_URL}/progress`, { headers });
    recordTest('Student - Get Progress', response.status === 200, `- Status: ${response.status}`);
  } catch (err) {
    recordTest('Student - Get Progress', false, `- Error: ${err.message}`);
  }
}

// Test admin endpoints
async function testAdminEndpoints(token) {
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test get stats
  try {
    const response = await axios.get(`${API_URL}/admin/stats`, { headers });
    recordTest('Admin - Get Stats', response.status === 200, `- Status: ${response.status}`);
  } catch (err) {
    recordTest('Admin - Get Stats', false, `- Error: ${err.message}`);
  }
  
  // Test get subjects
  try {
    const response = await axios.get(`${API_URL}/admin/subjects`, { headers });
    recordTest('Admin - Get Subjects', response.status === 200, `- Status: ${response.status}`);
  } catch (err) {
    recordTest('Admin - Get Subjects', false, `- Error: ${err.message}`);
  }
}

// Test recruiter endpoints
async function testRecruiterEndpoints(token) {
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test get drives
  try {
    const response = await axios.get(`${API_URL}/recruiter/drives`, { headers });
    recordTest('Recruiter - Get Drives', response.status === 200, `- Status: ${response.status}`);
  } catch (err) {
    recordTest('Recruiter - Get Drives', false, `- Error: ${err.message}`);
  }
}

// Test concurrent requests
async function testConcurrency(token) {
  const headers = { Authorization: `Bearer ${token}` };
  const concurrentRequests = 50;
  
  info(`Testing ${concurrentRequests} concurrent requests...`);
  
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < concurrentRequests; i++) {
    promises.push(
      axios.get(`${API_URL}/progress`, { headers }).catch(err => ({ error: err.message }))
    );
  }
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  
  recordTest(
    'Concurrency Test',
    successful >= concurrentRequests * 0.95,
    `- ${successful}/${concurrentRequests} successful in ${duration}ms`
  );
  
  if (failed > 0) {
    warn(`${failed} requests failed`);
  }
}

// Print test results
function printResults() {
  log('\n=== Test Results ===\n', 'blue');
  
  log(`Total Tests: ${testResults.passed + testResults.failed}`, 'cyan');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%\n`, 'cyan');
  
  if (testResults.failed > 0) {
    log('Failed Tests:', 'red');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => error(`  - ${t.name}: ${t.message}`));
  }
  
  if (testResults.failed === 0) {
    log('\n🎉 All tests passed! System is working correctly.\n', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.\n', 'yellow');
  }
}

// Run tests
log('\n🚀 Starting CampusGrid System Test...\n', 'cyan');
log('This will:', 'cyan');
log('  1. Create a test database', 'cyan');
log('  2. Seed sample data', 'cyan');
log('  3. Create test users', 'cyan');
log('  4. Test all endpoints', 'cyan');
log('  5. Clean up test data\n', 'cyan');

// Check if server is running
axios.get(`${API_URL.replace('/api', '')}/api/health`)
  .then(() => {
    success('Server is running\n');
    runTests();
  })
  .catch(() => {
    error('Server is not running!');
    error('Please start the server first: npm run dev\n');
    process.exit(1);
  });
