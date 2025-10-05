# Security Update - Vulnerability Fixes

## Overview

This update addresses **critical security vulnerabilities** in the backend dependencies by replacing deprecated and vulnerable packages with secure, actively maintained alternatives.

## Vulnerabilities Fixed

### 1. **vm2** (CRITICAL) - Removed
- **Issue**: Sandbox escape vulnerabilities (CVE-2023-29199, CVE-2023-30547)
- **Status**: Package is deprecated and unmaintained
- **Action**: Removed from dependencies (was imported but never used)
- **Impact**: No functionality affected

### 2. **@sendinblue/client** (CRITICAL) - Replaced
- **Issue**: Depends on deprecated `request` package with vulnerable `form-data` and `tough-cookie`
- **Action**: Replaced with `nodemailer` v6.9.7
- **Impact**: Email functionality maintained with enhanced flexibility

## Changes Required

### 1. Update Dependencies

Run the following commands in the `backend` directory:

```bash
# Remove old packages
npm uninstall @sendinblue/client vm2

# Install new packages
npm install nodemailer@^6.9.7

# Or simply run
npm install
```

### 2. Update Environment Variables

The email configuration has changed. Update your `.env` file:

#### Old Configuration (Brevo API)
```env
BREVO_API_KEY=your_api_key
BREVO_SENDER_EMAIL=noreply@campusgrid.com
BREVO_SENDER_NAME=CampusGrid
```

#### New Configuration (Choose One Option)

**Option 1: Brevo SMTP (Recommended if you're already using Brevo)**
```env
BREVO_SMTP_KEY=your_brevo_smtp_key
BREVO_SMTP_USER=your_brevo_login_email
BREVO_SENDER_EMAIL=noreply@campusgrid.com
EMAIL_SENDER_NAME=CampusGrid
EMAIL_SENDER_ADDRESS=noreply@campusgrid.com
```

**Option 2: Gmail (Easy for development)**
```env
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
EMAIL_SENDER_NAME=CampusGrid
EMAIL_SENDER_ADDRESS=your_gmail@gmail.com
```

**Option 3: SendGrid**
```env
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_SENDER_NAME=CampusGrid
EMAIL_SENDER_ADDRESS=noreply@campusgrid.com
```

**Option 4: Custom SMTP**
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_username
SMTP_PASSWORD=your_password
EMAIL_SENDER_NAME=CampusGrid
EMAIL_SENDER_ADDRESS=noreply@campusgrid.com
```

### 3. Get Credentials

#### For Brevo SMTP:
1. Log in to [Brevo](https://app.brevo.com)
2. Go to **Settings** → **SMTP & API** → **SMTP**
3. Copy your SMTP key and login email

#### For Gmail:
1. Enable 2-Factor Authentication on your Google Account
2. Go to **Google Account** → **Security** → **App Passwords**
3. Generate a new app password for "Mail"
4. Use the 16-character password in your `.env`

#### For SendGrid:
1. Log in to [SendGrid](https://app.sendgrid.com)
2. Go to **Settings** → **API Keys**
3. Create a new API key with "Mail Send" permissions

## Code Changes

### Files Modified:
1. **`backend/utils/codeExecutor.js`** - Removed unused `vm2` import
2. **`backend/utils/otpService.js`** - Replaced Brevo API client with Nodemailer
3. **`backend/package.json`** - Updated dependencies
4. **Documentation files** - Updated environment variable examples

### No Breaking Changes
- All existing functionality is preserved
- OTP email sending works exactly the same
- No API changes required

## Verification

After updating, verify the changes:

```bash
# Check for vulnerabilities
npm audit

# Expected result: 0 vulnerabilities
```

Test email functionality:
```bash
# Start the backend
npm run dev

# Test OTP sending through your application
# The email should be sent successfully
```

## Benefits

1. **Security**: All critical vulnerabilities resolved
2. **Flexibility**: Support for multiple email providers (Brevo, Gmail, SendGrid, Custom SMTP)
3. **Maintenance**: Using actively maintained packages
4. **Performance**: Nodemailer is lightweight and efficient

## Rollback (If Needed)

If you encounter issues, you can temporarily rollback:

```bash
npm install @sendinblue/client@^3.3.1
# Revert code changes in utils/otpService.js
```

However, this is **not recommended** due to security vulnerabilities.

## Support

If you encounter any issues:
1. Check that your email credentials are correct
2. Verify your email provider allows SMTP access
3. Check the console logs for detailed error messages
4. Refer to the updated documentation in `README.md` and `docs/COMPLETE_SETUP.md`

## Timeline

- **Immediate Action Required**: Update dependencies and environment variables
- **Testing**: Verify email functionality in development
- **Production**: Deploy after successful testing

---

**Last Updated**: 2025-10-05  
**Severity**: Critical  
**Status**: Fixed
