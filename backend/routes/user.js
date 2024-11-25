const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const { storage } = require('../utils/multerConfig'); // Import Cloudinary storage configuration
const upload = multer({ storage }); // Multer middleware with Cloudinary storage
const router = express.Router();
const bcrypt = require('bcryptjs');
// Fetch user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/update-profile', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, mobileNumber } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.name = name || user.name;
    user.mobileNumber = mobileNumber || user.mobileNumber;

    // Update profile picture if provided
    if (req.file) {
      user.profilePicture = req.file.path;
    }

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// // Change Password API
// router.put('/change-password', authMiddleware, async (req, res) => {
//   const { currentPassword, newPassword } = req.body;

//   try {
//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({ message: 'Current password and new password are required' });
//     }

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Compare current password
//     const isMatch = await bcrypt.compare(currentPassword, user.password);
//     console.log('Password Comparison:', { currentPassword, storedPassword: user.password, isMatch });

//     if (!isMatch) {
//       return res.status(400).json({ message: 'Current password is incorrect' });
//     }

//     // Hash new password and save
//     user.password = await bcrypt.hash(newPassword, 10);
//     await user.save();

//     res.status(200).json({ message: 'Password updated successfully' });
//   } catch (error) {
//     console.error('Error changing password:', error.message);
//     res.status(500).json({ message: 'Error changing password' });
//   }
// });

module.exports = router;
