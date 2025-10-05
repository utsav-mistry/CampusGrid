#  CampusGrid - College Internship Cell Exam Platform

A lightweight, ultra-secure exam platform with **LeetCode-style code execution**, **full 1-10 star progression**, and **comprehensive frontend monitoring**.

##  Key Features

### Dual Email System
- **General Email**: Personal email for registration and general exams
- **University Email**: @mail.ljku.edu.in for recruitment drives
- Both emails point to the same user profile
- Separate passwords for each login method

### Two Exam Modes

#### 1. General Exams (Automatic)
- Student selects subject + level
- System generates exam with random questions
- No human intervention needed
- Always lenient mode
- Instant badge/star/prestige updates

#### 2. Recruitment Drives (Manual)
- Recruiters create custom exams
- Pre-selected questions (MCQ & Code)
- Strict/lenient mode configurable
- **Requires university email login**
- Company-specific assessments

### Badge & Prestige System

**Core Badges** (Subject + Level specific):
- Each subject has 4 levels: Beginner, Intermediate, Advanced, Master
- Each level has independent 0-10 star progression
- Example: Java Beginner (0-10), Java Advanced (0-10) - separate tracks
- Stars earned based on exams completed + average score
- Prestige points: Beginner (1pt/), Intermediate (2pt/), Advanced (3pt/), Master (5pt/)

**Soft Badges** (Achievement-based, 20+ badges):
- 4 tiers: Bronze, Silver, Gold, Platinum
- Milestone badges (First Steps, Exam Veteran, etc.)
- Performance badges (Perfectionist, High Achiever, etc.)
- Discipline badges (Focus Keeper, Clean Record, etc.)
- Streak badges (Dedicated Learner, Marathon Runner, etc.)
- Special badges (Early Bird, Night Owl, etc.)

### Ultra-Strict Frontend Security
- **9 monitoring systems** active during exams
- Fullscreen enforcement (no grace period in strict mode)
- Tab/window switch detection
- Mouse leave tracking
- Keyboard shortcut blocking (DevTools, Alt+Tab, etc.)
- Inactivity detection (5 minutes)
- Screenshot attempt detection
- Real-time violation indicators

### Lightweight Code Execution
- **LeetCode-style** string output matching
- No Docker required (optional for extra security)
- Direct process execution (minimal overhead)
- 50-60% faster than containerized approach
- Simple console.log() based evaluation

##  Quick Start

** For complete setup instructions, see: [`docs/COMPLETE_SETUP.md`](docs/COMPLETE_SETUP.md)**

### 5-Minute Setup

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Configure environment (create backend/.env)
# See docs/COMPLETE_SETUP.md for details

# 3. Setup database
cd backend
npm run create-indexes    # Create indexes (required!)
npm run create-admin      # Create admin account

# 4. Start servers
npm run dev               # Backend (port 5000)
cd ../frontend && npm run dev  # Frontend (port 5173)

# 5. Test system
cd backend && npm test    # Run automated tests
```

##  Project Structure

```
CampusGrid/
 backend/              # Node.js + Express API
    server.js         # Main server file
    ecosystem.config.js  # PM2 production config
    test-system.js    # Automated test script
    scripts/          # Database & admin scripts
 frontend/             # React + Vite app
 docs/                 # Documentation
     COMPLETE_SETUP.md #  Complete setup guide
     TODO.md           # Project status
```

##  Documentation

- **[COMPLETE_SETUP.md](docs/COMPLETE_SETUP.md)** - Complete setup guide (development + production)
- **[TODO.md](docs/TODO.md)** - Project status and features

##  Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campusgrid
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=24h
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Email Configuration (Choose one option)
# Option 1: Brevo (Sendinblue) SMTP
BREVO_SMTP_KEY=your_brevo_smtp_key
BREVO_SMTP_USER=your_brevo_login_email
BREVO_SENDER_EMAIL=noreply@campusgrid.com

# Option 2: Gmail (requires App Password)
# GMAIL_USER=your_gmail@gmail.com
# GMAIL_APP_PASSWORD=your_app_password

# Option 3: SendGrid
# SENDGRID_API_KEY=your_sendgrid_api_key

# Option 4: Custom SMTP
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your_smtp_user
# SMTP_PASSWORD=your_smtp_password

# Email Sender Info
EMAIL_SENDER_NAME=CampusGrid
EMAIL_SENDER_ADDRESS=noreply@campusgrid.com

# Code Execution
CODE_EXECUTION_TIMEOUT=5000
MAX_CODE_LENGTH=10000
```

##  API Documentation

### Authentication

```
POST /api/auth/register                    - Register with general email
POST /api/auth/send-otp                    - Send OTP
POST /api/auth/verify-otp                  - Verify OTP
POST /api/auth/login                       - Login (auto-detects email type)
POST /api/auth/link-university-email       - Link university email
POST /api/auth/verify-university-email     - Verify university email
GET  /api/auth/me                          - Get current user
```

### General Exams (Automatic)

```
GET  /api/exams/general/subjects           - Get subjects & levels
POST /api/exams/general/start              - Start auto-generated exam
```

### Recruitment Drives

```
GET  /api/exams                            - List recruitment drives
GET  /api/exams/:id                        - Get drive details
POST /api/exams/:id/start                  - Start drive exam
```

### Common Exam Operations

```
POST /api/exams/submit                     - Submit answer
POST /api/exams/finish                     - Finish exam
POST /api/exams/violation                  - Report violation
```

### Progress

```
GET  /api/progress                         - Get student progress
GET  /api/progress/history                 - Exam history
GET  /api/progress/badges                  - All badges
GET  /api/progress/prestige                - Prestige breakdown
```

##  User Flows

### Student Registration & General Exam

1. Register with general email (e.g., student@gmail.com)
2. Verify email with OTP
3. Login
4. Go to Exam Center
5. Select subject (e.g., Java) and level (e.g., Beginner)
6. System generates exam with 10 random questions
7. Take exam in fullscreen mode
8. Submit and get instant results
9. Badge/star/prestige automatically updated

### Linking University Email for Drives

1. Login with general email
2. Go to Profile
3. Enter university email (@mail.ljku.edu.in)
4. Set university password
5. Verify with OTP sent to university email
6. Now can login with university email for drives

### Taking Recruitment Drive

1. Login with university email
2. Go to Exam Center  Recruitment Drives tab
3. See available company drives
4. Start drive (validates university email)
5. Take exam in strict/lenient mode (as configured)
6. Results sent to recruiter
7. Progress also updated

##  Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Brevo (Sendinblue) for emails
- vm2 for code execution
- bcrypt for password hashing

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Axios
- React Query
- Lucide Icons

##  Security

- Password hashing with bcrypt (10 rounds)
- JWT tokens with 24-hour expiry
- OTP verification (5-minute expiry, max 3 attempts)
- Code execution sandbox (vm2)
- Fullscreen enforcement
- Tab switch detection
- Rate limiting
- CORS configuration
- Role-based access control

##  Database Schema

### Users
- Dual email support (email + universityEmail)
- Separate passwords for each
- Role-based (student, admin, recruiter)

### Questions
- Type: MCQ or Code
- Subject and level association
- Public/private flag
- Test cases for code questions

### Exam Attempts
- Links to exam (null for general exams)
- Stores answers and violations
- Auto-calculated scores

### Student Progress
- Subject-wise level tracking
- Badge and star progression
- Prestige calculation
- Generic badges

##  UI Features

- Responsive design
- Dark mode support (coming soon)
- Fullscreen exam interface
- Real-time timer
- Violation warnings
- Progress visualization
- Badge showcase
- Analytics charts

##  Roadmap

### Phase 1 (Current - MVP)
-  Dual email authentication
-  General exam auto-generation
-  Recruitment drive exams
-  MCQ & Code questions
-  Badge/star/prestige system
-  Student portal
-  Admin portal (in progress)
-  Recruiter portal (in progress)

### Phase 2 (Future)
- AI question difficulty prediction
- Advanced analytics
- Video proctoring
- Plagiarism detection
- Mobile app
- Bulk operations
- Advanced reporting

##  User Roles

### Student
- Take general exams
- Take recruitment drives (with university email)
- View progress and badges
- Link university email

### Admin
- Manage subjects
- Manage question bank
- View all student data
- Monitor live exams
- Analytics dashboard

### Recruiter
- Create recruitment drives
- Add custom questions
- View applicant results
- Shortlist candidates
- Export reports

##  License

MIT

##  Contributing

Contributions welcome! Please read contributing guidelines first.

##  Support

For support, email support@campusgrid.com or create an issue.

---

**Built with  for LJ University**
