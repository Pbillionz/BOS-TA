const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const { generateToken, generateVerificationToken, verifyToken } = require('../utils/tokenUtils');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/emailUtils');
const { auth } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student
 * @access  Public
 */
router.post(
  '/register',
  [
    body('firstName', 'First name is required').notEmpty().trim(),
    body('lastName', 'Last name is required').notEmpty().trim(),
    body('email', 'Please enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('experienceLevel', 'Experience level is required').isIn(['beginner', 'intermediate', 'advanced']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, email, password, experienceLevel, tradingGoals } = req.body;

      // Check if user already exists
      let student = await Student.findOne({ email });
      if (student) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate verification token
      const verificationToken = generateVerificationToken(email);

      // Create student
      student = new Student({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        experienceLevel,
        tradingGoals,
        verificationToken,
      });

      await student.save();

      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      // Generate auth token
      const token = generateToken(student._id, 'student');

      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        token,
        student: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
        },
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Server error during registration' });
    }
  }
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const student = await Student.findOne({ email: decoded.email });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Mark as verified
    student.isVerified = true;
    student.verificationToken = null;
    await student.save();

    // Send welcome email
    await sendWelcomeEmail(student.email, student.firstName);

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email', 'Please enter a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find student
      const student = await Student.findOne({ email }).select('+password');
      if (!student) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Check if verified
      if (!student.isVerified) {
        return res.status(400).json({ error: 'Please verify your email first' });
      }

      // Generate token
      const token = generateToken(student._id, 'student');

      res.json({
        message: 'Login successful',
        token,
        student: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          experienceLevel: student.experienceLevel,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.userId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', auth, (req, res) => {
  // Token invalidation happens on client side
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
