const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const { auth, adminOnly } = require('../middleware/auth');

/**
 * @route   GET /api/mentors
 * @desc    Get all approved mentors
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { specialization, minExperience, availability } = req.query;
    let query = { isApproved: true };

    if (specialization) {
      query.specializations = { $in: [specialization] };
    }
    if (minExperience) {
      query.yearsOfExperience = { $gte: parseInt(minExperience) };
    }
    if (availability) {
      query.availability = availability;
    }

    const mentors = await Mentor.find(query).sort({ rating: -1 }).limit(100);
    res.json(mentors);
  } catch (err) {
    console.error('Get mentors error:', err);
    res.status(500).json({ error: 'Server error fetching mentors' });
  }
});

/**
 * @route   GET /api/mentors/:id
 * @desc    Get mentor details
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    res.json(mentor);
  } catch (err) {
    console.error('Get mentor error:', err);
    res.status(500).json({ error: 'Server error fetching mentor' });
  }
});

/**
 * @route   POST /api/mentors
 * @desc    Create new mentor profile
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      title,
      bio,
      yearsOfExperience,
      specializations,
      hourlyRate,
      maxStudents,
      timezone,
      certifications,
      socialLinks,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !title || !bio || !yearsOfExperience) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const mentor = new Mentor({
      firstName,
      lastName,
      email: req.userId, // This should be populated from auth
      title,
      bio,
      yearsOfExperience,
      specializations: specializations || [],
      hourlyRate: hourlyRate || 0,
      maxStudents: maxStudents || 5,
      timezone: timezone || 'UTC',
      certifications: certifications || [],
      socialLinks: socialLinks || {},
      isApproved: false, // Admin review required
    });

    await mentor.save();

    res.status(201).json({
      message: 'Mentor profile created. Awaiting admin approval.',
      mentor,
    });
  } catch (err) {
    console.error('Create mentor error:', err);
    res.status(500).json({ error: 'Server error creating mentor profile' });
  }
});

/**
 * @route   PUT /api/mentors/:id
 * @desc    Update mentor profile
 * @access  Private
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Update fields
    const updateFields = [
      'firstName',
      'lastName',
      'title',
      'bio',
      'yearsOfExperience',
      'specializations',
      'hourlyRate',
      'maxStudents',
      'timezone',
      'availability',
      'profileImage',
      'socialLinks',
      'certifications',
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        mentor[field] = req.body[field];
      }
    });

    await mentor.save();

    res.json({
      message: 'Mentor profile updated successfully',
      mentor,
    });
  } catch (err) {
    console.error('Update mentor error:', err);
    res.status(500).json({ error: 'Server error updating mentor profile' });
  }
});

/**
 * @route   POST /api/mentors/:id/approve
 * @desc    Approve mentor (admin only)
 * @access  Private (Admin)
 */
router.post('/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json({ message: 'Mentor approved successfully', mentor });
  } catch (err) {
    console.error('Approve mentor error:', err);
    res.status(500).json({ error: 'Server error approving mentor' });
  }
});

module.exports = router;
