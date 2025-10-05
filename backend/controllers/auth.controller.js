import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { sendOTP, verifyOTP } from '../utils/otpService.js';
import { generateToken } from '../middleware/auth.js';

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, name, role, studentId, branch, year, companyName, designation } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user profile based on role
    const profile = { name };
    if (role === 'student') {
      profile.studentId = studentId;
      profile.branch = branch;
      profile.year = year;
    } else if (role === 'recruiter') {
      profile.companyName = companyName;
      profile.designation = designation;
    }

    // Create user (email not verified yet)
    const user = await User.create({
      email,
      password,
      role,
      profile,
      isEmailVerified: false
    });

    // Send OTP for verification
    await sendOTP(email, 'registration');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * @desc    Send OTP to email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOTPHandler = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, purpose = 'registration' } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user && purpose !== 'registration') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await sendOTP(email, purpose);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTPHandler = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, otp, purpose } = req.body;

    // Verify OTP
    await verifyOTP(email, otp, purpose);

    // If registration, mark email as verified
    if (purpose === 'registration') {
      const user = await User.findOne({ email });
      if (user) {
        user.isEmailVerified = true;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Login user (supports both general and university email)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    
    // Check if it's a university email
    const isUniversityEmail = email.endsWith('@mail.ljku.edu.in');
    
    let user;
    let isMatch = false;

    if (isUniversityEmail) {
      // Login with university email
      user = await User.findOne({ universityEmail: email }).select('+universityPassword');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials or university email not linked'
        });
      }

      // Check if university email is verified
      if (!user.isUniversityEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your university email first',
          requiresVerification: true
        });
      }

      // Check university password
      isMatch = await user.compareUniversityPassword(password);
      
    } else {
      // Login with general email
      user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email first',
          requiresVerification: true
        });
      }

      // Check general password
      isMatch = await user.comparePassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        loginType: isUniversityEmail ? 'university' : 'general',
        user: {
          id: user._id,
          email: user.email,
          universityEmail: user.universityEmail,
          role: user.role,
          profile: user.profile,
          hasUniversityEmail: !!user.universityEmail,
          isUniversityEmailVerified: user.isUniversityEmailVerified
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
};

/**
 * @desc    Link university email to existing account
 * @route   POST /api/auth/link-university-email
 * @access  Private (Student only)
 */
export const linkUniversityEmail = async (req, res) => {
  try {
    const { universityEmail, universityPassword } = req.body;

    // Validate university email format
    if (!universityEmail.endsWith('@mail.ljku.edu.in')) {
      return res.status(400).json({
        success: false,
        message: 'Must be a valid LJ University email (@mail.ljku.edu.in)'
      });
    }

    // Check if university email already exists
    const existingUser = await User.findOne({ universityEmail });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This university email is already linked to another account'
      });
    }

    // Update user with university email
    const user = await User.findById(req.user._id);
    user.universityEmail = universityEmail;
    user.universityPassword = universityPassword;
    user.isUniversityEmailVerified = false;
    await user.save();

    // Send OTP to university email
    await sendOTP(universityEmail, 'registration');

    res.json({
      success: true,
      message: 'University email linked. Please verify with the OTP sent to your university email.',
      data: {
        universityEmail: user.universityEmail
      }
    });

  } catch (error) {
    console.error('Link university email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link university email',
      error: error.message
    });
  }
};

/**
 * @desc    Verify university email OTP
 * @route   POST /api/auth/verify-university-email
 * @access  Private (Student only)
 */
export const verifyUniversityEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.universityEmail) {
      return res.status(400).json({
        success: false,
        message: 'No university email linked to this account'
      });
    }

    // Verify OTP
    await verifyOTP(user.universityEmail, otp, 'registration');

    // Mark university email as verified
    user.isUniversityEmailVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'University email verified successfully',
      data: {
        universityEmail: user.universityEmail,
        isUniversityEmailVerified: true
      }
    });

  } catch (error) {
    console.error('Verify university email error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
