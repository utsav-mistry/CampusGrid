# CampusGrid Backend

College Internship Cell Exam & Progress Platform - Backend API

## Features

- Dual Email Authentication (General + University @mail.ljku.edu.in)
- OTP Verification via Brevo
- JWT Authentication
- MCQ & Code Question Support
- Code Execution Sandbox (vm2)
- Badge, Star & Prestige System
- Exam Violation Tracking
- Role-based Access Control (Student, Admin, Recruiter)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campusgrid
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=24h
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Brevo (Sendinblue) Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=noreply@campusgrid.com
BREVO_SENDER_NAME=CampusGrid

# Code Execution
CODE_EXECUTION_TIMEOUT=5000
MAX_CODE_LENGTH=10000
```

### 3. Start MongoDB

Make sure MongoDB is running locally:

```bash
# Windows
mongod

# Or use MongoDB Compass
```

### 4. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login (supports both general and university email)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/link-university-email` - Link university email to account
- `POST /api/auth/verify-university-email` - Verify university email

### Exams (Student)

- `GET /api/exams` - Get available exams
- `GET /api/exams/:id` - Get exam details
- `POST /api/exams/:id/start` - Start exam
- `POST /api/exams/:id/submit` - Submit answer
- `POST /api/exams/:id/finish` - Finish exam
- `POST /api/exams/:id/violation` - Report violation

### Progress (Student)

- `GET /api/progress` - Get student progress
- `GET /api/progress/history` - Get exam history
- `GET /api/progress/badges` - Get all badges
- `GET /api/progress/prestige` - Get prestige breakdown

## Dual Email System

### How It Works

1. **Registration**: Students register with their general email (e.g., student@gmail.com)
2. **Profile Setup**: After login, students can link their university email (@mail.ljku.edu.in)
3. **Verification**: University email requires OTP verification
4. **Login**: Students can login with either email using respective passwords
5. **Exam Access**:
   - General exams: Can be taken with any login
   - College drives: **MUST** login with university email (@mail.ljku.edu.in)

### Example Flow

```javascript
// 1. Register with general email
POST /api/auth/register
{
  "email": "student@gmail.com",
  "password": "password123",
  "name": "John Doe",
  "role": "student",
  "studentId": "2021001",
  "branch": "Computer Science",
  "year": 3
}

// 2. Verify general email OTP
POST /api/auth/verify-otp
{
  "email": "student@gmail.com",
  "otp": "123456",
  "purpose": "registration"
}

// 3. Login with general email
POST /api/auth/login
{
  "email": "student@gmail.com",
  "password": "password123"
}

// 4. Link university email (requires authentication)
POST /api/auth/link-university-email
Headers: { Authorization: "Bearer <token>" }
{
  "universityEmail": "johndoe@mail.ljku.edu.in",
  "universityPassword": "unipass123"
}

// 5. Verify university email OTP
POST /api/auth/verify-university-email
Headers: { Authorization: "Bearer <token>" }
{
  "otp": "654321"
}

// 6. Now can login with university email for drives
POST /api/auth/login
{
  "email": "johndoe@mail.ljku.edu.in",
  "password": "unipass123"
}
```

## Database Models

- **User** - User accounts with dual email support
- **Subject** - Subjects (Java, Python, etc.)
- **Question** - MCQ and Code questions
- **Exam** - Exam configuration
- **ExamAttempt** - Student exam attempts
- **OTPVerification** - OTP records
- **StudentProgress** - Badge, star, prestige tracking

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- OTP expiry (5 minutes)
- Rate limiting
- Code execution sandbox
- Role-based access control
- University email validation for drives

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Brevo (Sendinblue) for emails
- vm2 for code execution
- bcrypt for password hashing
