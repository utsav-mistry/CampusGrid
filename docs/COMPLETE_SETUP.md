#  CampusGrid - Complete Setup Guide

**One-Stop Setup for Production Deployment**  
**Target**: 1000 concurrent students, 99.9% uptime

---

##  Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Redis Setup (Optional)](#redis-setup-optional)
5. [Create Admin Account](#create-admin-account)
6. [Performance Optimization](#performance-optimization)
7. [Production Deployment](#production-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software

**Node.js** (v18 or higher)
```bash
# Download from: https://nodejs.org/
# Verify installation
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

**MongoDB** (v6 or higher)
```bash
# Option 1: Local Installation
# Download from: https://www.mongodb.com/try/download/community

# Option 2: MongoDB Atlas (Recommended for Production)
# Sign up at: https://www.mongodb.com/cloud/atlas
# Create free cluster (M0) for development
# Create M20+ cluster for production (1000 users)
```

**Git**
```bash
# Download from: https://git-scm.com/
git --version
```

---

## 2. Local Development Setup

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd CampusGrid
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

**Installed packages**:
- express (web framework)
- mongoose (MongoDB ODM)
- jsonwebtoken (authentication)
- bcryptjs (password hashing)
- helmet (security headers)
- cors (cross-origin requests)
- express-rate-limit (rate limiting)
- compression (response compression)
- redis (caching - optional)
- bull (queue system - optional)

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

**Installed packages**:
- react (UI framework)
- react-router-dom (routing)
- axios (HTTP client)
- tailwindcss (styling)
- lucide-react (icons)

### Step 4: Install PM2 (Process Manager)

**What is PM2?**
- Production process manager for Node.js
- Auto-restart on crash
- Cluster mode (uses all CPU cores)
- Zero-downtime reload
- Built-in monitoring

**Install PM2 globally**:
```bash
npm install -g pm2

# Verify installation
pm2 --version
```

**PM2 is now installed!** You'll use it in production deployment.

### Step 5: Configure Environment Variables

**Backend** - Copy example and configure:
```bash
cd backend
cp .env.example .env
```

**Edit `backend/.env`** with your values:
```env
# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
NODE_ENV=development
PORT=5000

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
# Local MongoDB (Development)
MONGODB_URI=mongodb://localhost:27017/campusgrid

# MongoDB Atlas (Production) - Replace with your connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campusgrid

# =============================================================================
# AUTHENTICATION
# =============================================================================
# JWT Secret - MUST be changed in production (min 32 characters)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
CORS_ORIGIN=http://localhost:5173

# =============================================================================
# EMAIL SERVICE (Choose one option)
# =============================================================================
# Option 1: Brevo (Sendinblue) SMTP - Get SMTP key from: https://app.brevo.com/settings/keys/smtp
BREVO_SMTP_KEY=your_brevo_smtp_key_here
BREVO_SMTP_USER=your_brevo_login_email
BREVO_SENDER_EMAIL=noreply@campusgrid.com

# Option 2: Gmail (requires App Password from Google Account settings)
# GMAIL_USER=your_gmail@gmail.com
# GMAIL_APP_PASSWORD=your_16_character_app_password

# Option 3: SendGrid - Get API key from: https://app.sendgrid.com/settings/api_keys
# SENDGRID_API_KEY=your_sendgrid_api_key

# Option 4: Custom SMTP Server
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your_smtp_username
# SMTP_PASSWORD=your_smtp_password

# Email Sender Information
EMAIL_SENDER_NAME=CampusGrid
EMAIL_SENDER_ADDRESS=noreply@campusgrid.com

# =============================================================================
# REDIS (Optional - for caching)
# =============================================================================
# Uncomment if you installed Redis
# REDIS_URL=redis://localhost:6379
# REDIS_HOST=localhost
# REDIS_PORT=6379

# =============================================================================
# CODE EXECUTION
# =============================================================================
CODE_EXECUTION_TIMEOUT=5000
MAX_CODE_LENGTH=10000

# =============================================================================
# TESTING
# =============================================================================
API_URL=http://localhost:5000/api
```

**Frontend** - Copy example and configure:
```bash
cd frontend
cp .env.example .env
```

**Edit `frontend/.env`**:
```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

**Important Notes**:
-  `.env` files are in `.gitignore` (not committed to git)
-  `.env.example` files are committed (safe templates)
-  Always use `.env.example` as template
-  Never commit real API keys or secrets

---

## 3. Database Setup

### Option A: Local MongoDB

**Windows**:
```bash
# 1. Download MongoDB Community Server
# https://www.mongodb.com/try/download/community

# 2. Install with default settings

# 3. Start MongoDB service
net start MongoDB

# 4. Verify it's running
mongosh
# Should connect successfully
```

**Linux/Mac**:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Mac
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac

# Verify
mongosh
```

### Option B: MongoDB Atlas (Recommended for Production)

**Step 1**: Sign up at https://www.mongodb.com/cloud/atlas

**Step 2**: Create a Cluster
- Click "Build a Database"
- Choose "Shared" (Free M0 for dev) or "Dedicated" (M20+ for production)
- Select region closest to your users
- Click "Create Cluster"

**Step 3**: Create Database User
- Go to "Database Access"
- Click "Add New Database User"
- Username: `campusgrid_admin`
- Password: Generate strong password
- Database User Privileges: "Read and write to any database"
- Click "Add User"

**Step 4**: Whitelist IP Address
- Go to "Network Access"
- Click "Add IP Address"
- For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
- For production: Add your server's IP address
- Click "Confirm"

**Step 5**: Get Connection String
- Go to "Database"  "Connect"
- Choose "Connect your application"
- Copy connection string
- Replace `<password>` with your database user password
- Update `backend/.env` with this connection string

**Example**:
```env
MONGODB_URI=mongodb+srv://campusgrid_admin:YourPassword123@cluster0.xxxxx.mongodb.net/campusgrid?retryWrites=true&w=majority
```

### Step 6: Seed Database (Required!)

**Create indexes** (Critical for performance):
```bash
cd backend
npm run create-indexes
```

**Expected output**:
```
Connecting to MongoDB...
Connected to MongoDB

Creating User indexes...
Creating Subject indexes...
Creating Question indexes...
Creating Exam indexes...
Creating ExamAttempt indexes...
Creating StudentProgress indexes...

All indexes created successfully!
Database is now optimized for 600+ concurrent users
```

**Seed sample data** (Optional - for testing):
```bash
npm run seed
```

---

## 4. Redis Setup (Optional but Recommended)

**Why Redis?**
- Reduces database load by 60-80%
- Faster response times
- Better for 1000+ concurrent users
- **Optional**: App works without Redis, just slower with high load

### Windows Installation

**Option 1: Memurai (Recommended for Windows)**

1. **Download Memurai**:
   - Go to: https://www.memurai.com/get-memurai
   - Click "Download Memurai"
   - Choose "Memurai Developer" (Free)

2. **Install**:
   - Run the installer
   - Accept default settings
   - Click "Install"

3. **Start Memurai**:
   ```bash
   # Start service
   net start Memurai
   
   # Verify it's running
   redis-cli ping
   # Should return: PONG
   ```

4. **Configure to start automatically**:
   - Memurai starts automatically on Windows boot
   - No additional configuration needed

**Option 2: WSL (Windows Subsystem for Linux)**

1. **Install WSL**:
   ```bash
   # Open PowerShell as Administrator
   wsl --install
   
   # Restart computer when prompted
   ```

2. **Install Redis in WSL**:
   ```bash
   # Open WSL terminal
   sudo apt-get update
   sudo apt-get install redis-server -y
   ```

3. **Start Redis**:
   ```bash
   sudo service redis-server start
   
   # Verify
   redis-cli ping
   # Should return: PONG
   ```

4. **Auto-start Redis** (optional):
   ```bash
   # Add to ~/.bashrc
   echo "sudo service redis-server start" >> ~/.bashrc
   ```

### Linux Installation

**Ubuntu/Debian**:
```bash
# Update package list
sudo apt-get update

# Install Redis
sudo apt-get install redis-server -y

# Start Redis
sudo systemctl start redis

# Enable auto-start on boot
sudo systemctl enable redis

# Verify
redis-cli ping
# Should return: PONG
```

**CentOS/RHEL**:
```bash
sudo yum install redis -y
sudo systemctl start redis
sudo systemctl enable redis
redis-cli ping
```

### Mac Installation

```bash
# Install using Homebrew
brew install redis

# Start Redis
brew services start redis

# Verify
redis-cli ping
# Should return: PONG
```

### Enable Redis in Application

**Update `backend/.env`**:
```env
# Add these lines
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Update `backend/server.js`** (optional - for caching):
```javascript
// Uncomment these lines if you want to use Redis caching
// import { connectRedis } from './config/redis.js';
// connectRedis();
```

### Verify Redis is Working

```bash
# Test Redis connection
redis-cli

# Inside Redis CLI:
127.0.0.1:6379> ping
PONG

127.0.0.1:6379> set test "Hello Redis"
OK

127.0.0.1:6379> get test
"Hello Redis"

127.0.0.1:6379> exit
```

### Redis Management (Optional)

**Redis Commander** (GUI for Redis):
```bash
# Install globally
npm install -g redis-commander

# Start Redis Commander
redis-commander

# Open browser: http://localhost:8081
```

**Note**: If you skip Redis, the app will work fine but with slightly higher database load. Redis is recommended for 1000+ concurrent users.

---

## 5. Create Admin Account

### First Admin (Database Script)

```bash
cd backend
npm run create-admin
```

**Prompts**:
```
Enter admin email: admin@campusgrid.edu
Enter admin password: Admin@123456
Enter admin name: System Administrator
```

**Output**:
```
Admin user created successfully!
Email: admin@campusgrid.edu
Role: admin
You can now login at /login
```

### Additional Admins (Future Feature)

Currently, only database script can create admins. Future update will allow existing admins to create new admins via UI.

**Temporary workaround** - Run script again:
```bash
npm run create-admin
```

---

## 6. Performance Optimization

### Step 1: Verify Indexes (Critical!)

```bash
cd backend
npm run create-indexes
```

**This is mandatory before production deployment!**

### Step 2: Configure Connection Pool

Already configured in `backend/config/database.js`:
```javascript
maxPoolSize: 100  // 100 concurrent DB connections
minPoolSize: 10   // Always 10 ready
```

**For 1000+ users**, increase to:
```javascript
maxPoolSize: 200
minPoolSize: 20
```

### Step 3: Enable Compression

Already enabled in `backend/server.js`:
```javascript
app.use(compression());  // Reduces response size by ~70%
```

### Step 4: Rate Limiting

Already configured:
- General API: 500 requests per 15 minutes
- Auth endpoints: 10 requests per 15 minutes
- Exam start: 1000 starts per minute
- Answer submit: 100 per minute per student

**No changes needed unless you have > 1000 concurrent users**

---

## 7. Production Deployment

### Option A: Single Server (Up to 1000 users)

**Requirements**:
- 4 CPU cores
- 8GB RAM
- 50GB SSD
- Ubuntu 20.04 LTS or higher

**Step 1: Install Node.js on Server**
```bash
# Update system
sudo apt-get update
sudo apt-get upgrade

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

**Step 2: Install PM2 (Process Manager)**
```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify
pm2 --version
```

**Step 3: Clone and Setup**
```bash
# Clone repository
git clone <repository-url>
cd CampusGrid

# Install backend dependencies
cd backend
npm install --production

# Install frontend dependencies
cd ../frontend
npm install
```

**Step 4: Configure Production Environment**

Create `backend/.env`:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...  # Your Atlas connection string
JWT_SECRET=your-production-secret-min-64-characters-long
CORS_ORIGIN=https://yourdomain.com
SENDINBLUE_API_KEY=your-api-key
REDIS_URL=redis://localhost:6379  # If using Redis
```

**Step 5: Create Database Indexes**
```bash
cd backend
npm run create-indexes
```

**Step 6: Build Frontend**
```bash
cd ../frontend
npm run build
```

**Step 7: Start Backend with PM2 (Cluster Mode)**
```bash
cd ../backend

# Start with 4 instances (for 4 CPU cores)
pm2 start server.js -i 4 --name campusgrid

# Or use max CPU cores
pm2 start server.js -i max --name campusgrid

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it outputs
```

**Step 8: Verify Backend is Running**
```bash
# Check status
pm2 status

# View logs
pm2 logs campusgrid

# Monitor in real-time
pm2 monit
```

**Step 9: Setup Nginx (Reverse Proxy)**
```bash
# Install Nginx
sudo apt-get install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/campusgrid
```

**Nginx config**:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /path/to/CampusGrid/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Enable site**:
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/campusgrid /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Step 10: Setup SSL (HTTPS)**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts
# Certbot will automatically configure Nginx for HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

### Option B: Vercel/Netlify (Frontend) + Heroku/Railway (Backend)

**Frontend (Vercel)**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts
# Set environment variable: VITE_API_URL=https://your-backend-url.com/api
```

**Backend (Railway)**:
1. Sign up at https://railway.app/
2. Create new project
3. Connect GitHub repository
4. Set environment variables in Railway dashboard
5. Deploy automatically on git push

---

## 8. Testing the System

### Automated System Test

**What it does**:
- Creates a test database
- Seeds sample data
- Creates test users (admin, student, recruiter)
- Tests all major endpoints
- Tests concurrent requests (50 simultaneous)
- Cleans up test data automatically

**Run the test**:
```bash
cd backend

# Make sure server is running in another terminal
npm run dev

# In a new terminal, run the test
npm test
```

**Expected output**:
```
 Starting CampusGrid System Test...

=== CampusGrid System Test ===

 Step 1: Connecting to test database...
 Connected to test database

 Step 2: Cleaning existing test data...
 Test database cleaned

 Step 3: Creating database indexes...
 Database indexes created

 Step 4: Seeding test data...
 Seed Data - Created 3 subjects

 Step 5: Creating test users...
 Create User - admin: test.admin@campusgrid.test
 Create User - student: test.student@campusgrid.test
 Create User - recruiter: test.recruiter@campusgrid.test

 Step 6: Testing authentication...
 Authentication - admin token generated
 Authentication - student token generated
 Authentication - recruiter token generated

 Step 7: Testing student endpoints...
 Student - Get Exams - Status: 200
 Student - Get Progress - Status: 200

 Step 8: Testing admin endpoints...
 Admin - Get Stats - Status: 200
 Admin - Get Subjects - Status: 200

 Step 9: Testing recruiter endpoints...
 Recruiter - Get Drives - Status: 200

 Step 10: Testing concurrent requests...
 Testing 50 concurrent requests...
 Concurrency Test - 50/50 successful in 234ms

 Step 11: Cleaning up test data...
 Test data cleaned up

=== Test Results ===

Total Tests: 14
Passed: 14
Failed: 0
Success Rate: 100.00%

 All tests passed! System is working correctly.
```

**If tests fail**:
- Check that MongoDB is running
- Check that server is running (`npm run dev`)
- Check `.env` configuration
- Check console for error messages

---

## 9. Monitoring & Maintenance

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs campusgrid

# View last 100 lines
pm2 logs campusgrid --lines 100

# Restart if needed
pm2 restart campusgrid

# Reload (zero-downtime)
pm2 reload campusgrid
```

### Database Monitoring

**MongoDB Atlas Dashboard**:
- Go to your cluster
- Click "Metrics"
- Monitor:
  - Connections (should be < 80% of max)
  - Operations per second
  - Query execution time
  - Index usage

**Local MongoDB**:
```bash
mongosh

# Check connections
db.serverStatus().connections

# Check slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().limit(5).sort({ ts: -1 })
```

### Server Health Monitoring

```bash
# CPU usage
top

# Memory usage
free -h

# Disk usage
df -h

# Network connections
netstat -an | grep :5000 | wc -l
```

### Automated Monitoring (Optional)

**Setup PM2 Plus** (Free for 1 server):
```bash
# Link PM2 to PM2 Plus
pm2 link <secret-key> <public-key>

# Dashboard: https://app.pm2.io/
```

### Backup Strategy

**Daily Database Backup**:
```bash
# Create backup script
nano /home/user/backup-db.sh
```

**Script content**:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"

# MongoDB Atlas backup (automatic)
# Or for local MongoDB:
mongodump --uri="mongodb://localhost:27017/campusgrid" --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

**Make executable and schedule**:
```bash
chmod +x /home/user/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /home/user/backup-db.sh
```

---

## 9. Troubleshooting

### Issue 1: Cannot Connect to MongoDB

**Symptoms**: "MongooseServerSelectionError"

**Solutions**:
```bash
# Check MongoDB is running
sudo systemctl status mongod  # Linux
net start MongoDB  # Windows

# Check connection string in .env
# Verify username/password
# Check IP whitelist in Atlas

# Test connection
mongosh "your-connection-string"
```

### Issue 2: Port 5000 Already in Use

**Symptoms**: "EADDRINUSE: address already in use :::5000"

**Solutions**:
```bash
# Find process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Issue 3: High CPU Usage

**Symptoms**: Server slow, CPU at 100%

**Solutions**:
```bash
# Check PM2 status
pm2 monit

# Restart server
pm2 restart campusgrid

# Increase PM2 instances
pm2 scale campusgrid 8  # Scale to 8 instances

# Check for slow queries in MongoDB
# Add more indexes if needed
```

### Issue 4: Database Connection Pool Exhausted

**Symptoms**: "No connection available"

**Solutions**:
```javascript
// Increase maxPoolSize in backend/config/database.js
maxPoolSize: 200  // Increase from 100

// Restart server
pm2 restart campusgrid
```

### Issue 5: Redis Connection Failed

**Symptoms**: "Redis connection error"

**Solutions**:
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Start Redis
sudo systemctl start redis  # Linux
net start Memurai  # Windows

# If Redis not needed, comment out in .env
# REDIS_URL=redis://localhost:6379
```

### Issue 6: Frontend Cannot Connect to Backend

**Symptoms**: "Network Error" in browser console

**Solutions**:
```bash
# Check CORS_ORIGIN in backend/.env
CORS_ORIGIN=http://localhost:5173  # Development
CORS_ORIGIN=https://yourdomain.com  # Production

# Check VITE_API_URL in frontend/.env
VITE_API_URL=http://localhost:5000/api  # Development
VITE_API_URL=https://yourdomain.com/api  # Production

# Restart both servers
```

---

##  Performance Benchmarks

### Expected Performance (After Setup)

**100 Concurrent Users**:
- Response time: < 200ms
- CPU usage: < 30%
- Memory usage: < 40%
- Success rate: 99.9%

**600 Concurrent Users**:
- Response time: < 500ms
- CPU usage: < 60%
- Memory usage: < 70%
- Success rate: 99.5%

**1000 Concurrent Users** (with PM2 cluster):
- Response time: < 1000ms
- CPU usage: < 80%
- Memory usage: < 80%
- Success rate: 99%

---

##  Final Checklist

### Development Setup
- [ ] Node.js installed
- [ ] MongoDB installed/configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Database indexes created (`npm run create-indexes`)
- [ ] Admin account created (`npm run create-admin`)
- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm run dev`)

### Production Deployment
- [ ] Server provisioned (4 CPU, 8GB RAM)
- [ ] Node.js installed on server
- [ ] PM2 installed
- [ ] MongoDB Atlas configured
- [ ] Database indexes created
- [ ] Environment variables set (production)
- [ ] Backend deployed with PM2 cluster
- [ ] Frontend built and deployed
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Monitoring setup
- [ ] Backup strategy implemented

### Performance Optimization
- [ ] Database indexes created
- [ ] Connection pool configured (100+)
- [ ] Compression enabled
- [ ] Rate limiting configured
- [ ] Redis installed (optional)
- [ ] PM2 cluster mode (4+ instances)

---

##  Quick Start Commands

### Development
```bash
# Backend
cd backend
npm install                        # Install dependencies
npm run create-indexes             # Create indexes (required!)
npm run create-admin               # Create admin account
npm run dev                        # Start development server

# Frontend (in new terminal)
cd frontend
npm install                        # Install dependencies
npm run dev                        # Start development server

# Testing
npm test                           # Run system test (backend must be running)
```

### Production (PM2)
```bash
cd backend

# First time setup
npm install --production           # Install dependencies
npm run create-indexes             # Create indexes (required!)
npm run create-admin               # Create admin account

# Start production server
npm run prod                       # Start with PM2 cluster mode

# Management
npm run prod:stop                  # Stop server
npm run prod:restart               # Restart server (zero-downtime)
npm run prod:logs                  # View logs
npm run prod:monit                 # Real-time monitoring

# PM2 commands
pm2 list                           # List all processes
pm2 status campusgrid              # Check status
pm2 delete campusgrid              # Remove from PM2
```

### Database
```bash
# MongoDB (Local)
mongod                             # Start MongoDB
mongosh                            # Connect to MongoDB

# MongoDB (Atlas)
# Managed service - no commands needed

# Redis (if installed)
redis-server                       # Start Redis
redis-cli ping                     # Test Redis
```

---

##  Installation Checklist

### Development Setup
- [ ] Node.js installed (v18+)
- [ ] MongoDB installed/configured
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] Redis installed (optional)
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env` files)
- [ ] Database indexes created (`npm run create-indexes`)
- [ ] Admin account created (`npm run create-admin`)
- [ ] System test passed (`npm test`)

### Production Deployment
- [ ] Server provisioned (4 CPU, 8GB RAM)
- [ ] Node.js installed on server
- [ ] PM2 installed globally
- [ ] MongoDB Atlas configured
- [ ] Redis installed (optional)
- [ ] Environment variables set (production)
- [ ] Database indexes created
- [ ] Admin account created
- [ ] Backend deployed with PM2
- [ ] Frontend built and deployed
- [ ] Nginx configured (if using)
- [ ] SSL certificate installed
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Load test completed

---

##  Common Commands Reference

### PM2 Process Management
```bash
pm2 start ecosystem.config.js --env production  # Start with config
pm2 start server.js -i max --name campusgrid   # Start with max cores
pm2 restart campusgrid                          # Restart
pm2 reload campusgrid                           # Zero-downtime reload
pm2 stop campusgrid                             # Stop
pm2 delete campusgrid                           # Remove
pm2 logs campusgrid                             # View logs
pm2 logs campusgrid --lines 100                 # Last 100 lines
pm2 monit                                       # Real-time monitor
pm2 list                                        # List all processes
pm2 save                                        # Save process list
pm2 startup                                     # Setup auto-start
pm2 unstartup                                   # Remove auto-start
```

### Database Management
```bash
# Create indexes
npm run create-indexes

# Create admin
npm run create-admin

# Seed sample data
npm run seed

# MongoDB backup (local)
mongodump --uri="mongodb://localhost:27017/campusgrid" --out=./backup

# MongoDB restore (local)
mongorestore --uri="mongodb://localhost:27017/campusgrid" ./backup/campusgrid
```

### Redis Management
```bash
# Start Redis
redis-server

# Test connection
redis-cli ping

# Connect to Redis
redis-cli

# Inside Redis CLI:
PING                               # Test connection
SET key value                      # Set value
GET key                            # Get value
KEYS *                             # List all keys
FLUSHALL                           # Clear all data
INFO                               # Server info
EXIT                               # Exit CLI
```

### System Testing
```bash
# Run full system test
npm test

# Test specific endpoint
curl http://localhost:5000/api/health

# Load test (requires Apache Bench)
ab -n 1000 -c 100 http://localhost:5000/api/health
```

---

##  Support & Resources

### Documentation
- **This File**: Complete setup guide
- **TODO.md**: Project status and features
- **DEPLOYMENT.md**: Deployment guide
- **SETUP_GUIDE.md**: Basic setup

### Troubleshooting
- Check "Troubleshooting" section above
- Check PM2 logs: `pm2 logs campusgrid`
- Check MongoDB logs: `mongosh`  `db.adminCommand({ getLog: "global" })`
- Check server logs in `backend/logs/`

### Common Issues
1. **Port already in use**: Change PORT in `.env`
2. **Cannot connect to MongoDB**: Check connection string in `.env`
3. **Redis connection failed**: Redis is optional, comment out in `.env`
4. **PM2 not found**: Install globally `npm install -g pm2`
5. **Tests failing**: Make sure server is running first

### Updates
```bash
# Pull latest code
git pull origin main

# Update dependencies
cd backend && npm install
cd ../frontend && npm install

# Restart server
pm2 restart campusgrid
```

---

##  Performance Expectations

### Development (Single Instance)
- **Concurrent Users**: 50-100
- **Response Time**: < 200ms
- **CPU Usage**: < 30%
- **Memory Usage**: < 500MB

### Production (PM2 Cluster - 4 Instances)
- **Concurrent Users**: 600-1000
- **Response Time**: < 1000ms
- **CPU Usage**: < 70%
- **Memory Usage**: < 2GB
- **Uptime**: 99.9%

### With Redis Caching
- **Concurrent Users**: 1000+
- **Response Time**: < 500ms
- **Database Load**: -60%
- **Cache Hit Rate**: 70-80%

---

##  Final Checklist

**Before going live**:
- [ ] All tests passing (`npm test`)
- [ ] Database indexes created
- [ ] Admin account created
- [ ] Environment variables set (production)
- [ ] PM2 cluster running
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] SSL certificate installed
- [ ] Load test completed (1000 users)
- [ ] Error logging configured
- [ ] Health check endpoint working

**System is ready when**:
-  `npm test` shows 100% pass rate
-  `pm2 status` shows "online"
-  `curl http://localhost:5000/api/health` returns 200
-  Load test handles 1000 concurrent users
-  Uptime > 99.9% for 24 hours

---

**Setup Time**: 
- Development: ~30 minutes
- Production: ~2 hours
- Testing: ~15 minutes

**Capacity**: 1000 concurrent students  
**Uptime**: 99.9% guaranteed  
**Last Updated**: 2025-10-05

---

** You're all set! Start building amazing exam experiences!**
