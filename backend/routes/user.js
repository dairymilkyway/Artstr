const express = require('express');
const upload = require('../utils/multerConfig'); // Cloudinary-Multer configuration
const User = require('../models/User'); // User model
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Update user profile
router.put('/update-profile', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const { firstName, lastName, email, username } = req.body;

    // Prepare updated data
    const updatedData = { firstName, lastName, email, username };

    // If a profile picture is uploaded, update the profilePicture field
    if (req.file) {
      updatedData.profilePicture = req.file.path; // Cloudinary automatically sets the URL here
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Fetch user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router;