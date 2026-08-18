const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { auth } = require('../middleware/auth');
const { sendApplicationNotificationEmail, sendApplicationResponseEmail } = require('../utils/emailUtils');

/**
 * @route   GET /api/applications
 * @desc    Get user applications
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};

    if (role === 'student') {
      query.studentId = req.userId;
    } else if (role === 'mentor') {
      query.mentorId = req.userId;
    }

    const applications = await Application.find(query)
      .populate('studentId', 'firstName lastName email')
      .populate('mentorId', 'firstName lastName title')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ error: 'Server error fetching applications' });
  }
});

/**
 * @route   POST /api/applications
 * @desc    Create new application
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { mentorId, message, programDuration } = req.body;

    if (!mentorId) {
      return res.status(400).json({ error: 'Mentor ID is required' });
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      studentId: req.userId,
      mentorId,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied to this mentor' });
    }

    const application = new Application({
      studentId: req.userId,
      mentorId,
      message: message || '',
      programDuration: programDuration || '3-months',
      status: 'pending',
    });

    await application.save();
    await application.populate('mentorId', 'firstName lastName email');

    // Send notification email to mentor
    try {
      await sendApplicationNotificationEmail(
        application.mentorId.email,
        `${application.mentorId.firstName} ${application.mentorId.lastName}`
      );
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (err) {
    console.error('Create application error:', err);
    res.status(500).json({ error: 'Server error creating application' });
  }
});

/**
 * @route   GET /api/applications/:id
 * @desc    Get application details
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('studentId')
      .populate('mentorId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check authorization
    if (
      req.userId !== application.studentId._id.toString() &&
      req.userId !== application.mentorId._id.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized to view this application' });
    }

    res.json(application);
  } catch (err) {
    console.error('Get application error:', err);
    res.status(500).json({ error: 'Server error fetching application' });
  }
});

/**
 * @route   PUT /api/applications/:id
 * @desc    Update application (status, response)
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, mentorResponse } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Only mentor can update status and response
    if (req.userId !== application.mentorId.toString()) {
      return res.status(403).json({ error: 'Only mentor can respond to application' });
    }

    if (status && ['accepted', 'rejected'].includes(status)) {
      application.status = status;
      application.respondedAt = new Date();
      application.mentorResponse = mentorResponse || '';

      await application.save();
      await application.populate('studentId', 'email firstName');

      // Send response email to student
      try {
        await sendApplicationResponseEmail(
          application.studentId.email,
          status,
          mentorResponse
        );
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
      }

      return res.json({
        message: `Application ${status} successfully`,
        application,
      });
    }

    res.status(400).json({ error: 'Invalid status' });
  } catch (err) {
    console.error('Update application error:', err);
    res.status(500).json({ error: 'Server error updating application' });
  }
});

/**
 * @route   DELETE /api/applications/:id
 * @desc    Cancel application
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Only student can cancel pending applications
    if (req.userId !== application.studentId.toString()) {
      return res.status(403).json({ error: 'Not authorized to cancel this application' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending applications' });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({ message: 'Application cancelled successfully' });
  } catch (err) {
    console.error('Delete application error:', err);
    res.status(500).json({ error: 'Server error cancelling application' });
  }
});

module.exports = router;
