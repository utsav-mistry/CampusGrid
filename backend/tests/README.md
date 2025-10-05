# CampusGrid Tests

This folder contains all test files for the CampusGrid backend.

## Test Files

### system.test.js
**Purpose**: Automated system test  
**What it tests**:
- Database connection
- User creation (admin, student, recruiter)
- Authentication (JWT tokens)
- Student endpoints
- Admin endpoints
- Recruiter endpoints
- Concurrent requests (50 simultaneous)

**Run**:
```bash
npm test
```

**Expected time**: ~30 seconds  
**Pass criteria**: 100% success rate

---

### load.test.js
**Purpose**: Load test for 800 concurrent exam takers  
**What it tests**:
- 800 concurrent exam starts
- 8,000 answer submissions (800 students × 10 answers)
- 100 violation reports
- 800 concurrent exam finishes

**Run**:
```bash
npm run test:load
```

**Expected time**: ~20-30 seconds  
**Pass criteria**: >= 95% success rate

---

## Running Tests

### System Test
```bash
# Start server first
npm run dev

# In another terminal, run test
npm test
```

### Load Test
```bash
# Start server first
npm run dev

# In another terminal, run load test
npm run test:load
```

### All Tests
```bash
# Start server
npm run dev

# Run both tests
npm test && npm run test:load
```

---

## Test Requirements

**Prerequisites**:
- Server must be running (`npm run dev`)
- MongoDB must be running
- Database indexes created (`npm run create-indexes`)

**Environment**:
- Uses test database: `campusgrid_test` (system test)
- Uses test database: `campusgrid_loadtest` (load test)
- Automatically cleans up after completion

---

## Test Output

### System Test Output
```
=== CampusGrid System Test ===

Step 1: Connecting to test database...
Step 2: Cleaning existing test data...
Step 3: Creating database indexes...
Step 4: Seeding test data...
Step 5: Creating test users...
Step 6: Testing authentication...
Step 7: Testing student endpoints...
Step 8: Testing admin endpoints...
Step 9: Testing recruiter endpoints...
Step 10: Testing concurrent requests...
Step 11: Cleaning up test data...

=== Test Results ===
Total Tests: 14
Passed: 14
Failed: 0
Success Rate: 100.00%

All tests passed! System is working correctly.
```

### Load Test Output
```
=== CAMPUSGRID EXAM LOAD TEST ===
Concurrent Students: 800
Total Requests: ~9700

Creating 800 test students...
Creating test exam...
Testing 800 concurrent exam starts...
Testing answer submissions (8000 total)...
Testing violation reporting (100 violations)...
Testing 800 concurrent exam finishes...

=== LOAD TEST RESULTS ===
Exam Starts: 800/800 (100%)
Answer Submissions: 8000/8000 (100%)
Violations: 100/100 (100%)
Exam Finishes: 800/800 (100%)

LOAD TEST PASSED!
Success rate: 100.0% (>= 95% required)
```

---

## Adding New Tests

To add a new test file:

1. Create file in `tests/` folder
2. Name it `*.test.js`
3. Add script to `package.json`:
```json
"test:yourtest": "node tests/yourtest.test.js"
```

Example structure:
```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function runTest() {
  try {
    // Your test code here
    console.log('Test passed!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTest();
```

---

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm install
      - run: cd backend && npm test
```

---

## Troubleshooting

**Test fails with "Server not running"**:
- Make sure server is running: `npm run dev`

**Test fails with "Database connection error"**:
- Check MongoDB is running
- Check `.env` has correct `MONGODB_URI`

**Load test fails with timeout**:
- Increase timeout in test file
- Check server has enough resources
- Run `npm run create-indexes` first

**Tests pass locally but fail in CI**:
- Add MongoDB service to CI config
- Set environment variables in CI
- Increase CI timeout limits

---

## Performance Benchmarks

**System Test**:
- Duration: ~30 seconds
- Requests: ~20
- Database: Creates/deletes test data
- Memory: < 100MB

**Load Test**:
- Duration: ~20-30 seconds
- Requests: ~9,700
- Database: Creates/deletes 800+ records
- Memory: < 500MB
- CPU: 50-70% during test

---

## Best Practices

1. Always run tests before committing
2. Run load test before production deployment
3. Keep test database separate from development
4. Clean up test data automatically
5. Use meaningful test names
6. Add comments for complex test logic
7. Test both success and failure scenarios
8. Monitor resource usage during load tests

---

Last Updated: 2025-10-05
