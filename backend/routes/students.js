const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/students
 * @desc    Get all students (limited info)
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find({}, '-password -verificationToken').limit(50);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching students' });
  }
});

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id, '-password -verificationToken');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching student' });
  }
});

/**
 * @route   PUT /api/students/:id
 * @desc    Update student profile
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    // Only allow updating own profile
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    const { firstName, lastName, phone, experienceLevel, tradingGoals, timezone, bio, profileImage } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update allowed fields
    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (phone) student.phone = phone;
    if (experienceLevel) student.experienceLevel = experienceLevel;
    if (tradingGoals) student.tradingGoals = tradingGoals;
    if (timezone) student.timezone = timezone;
    if (bio) student.bio = bio;
    if (profileImage) student.profileImage = profileImage;

    await student.save();

    res.json({
      message: 'Profile updated successfully',
      student,
    });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student account
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only allow deleting own account
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized to delete this account' });
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'Server error deleting account' });
  }
});

module.exports = router;
