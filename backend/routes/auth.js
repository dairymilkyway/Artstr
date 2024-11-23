const express = require('express');
const multer = require('multer');
const upload = require('../utils/multerConfig'); // Import Cloudinary storage configuration
const User = require('../models/User');
const admin = require('../firebaseAdmin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to authenticate JWT tokens
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization'); // Token sent in the Authorization header

  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken.uid; // Attach user ID from token payload to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Register Route
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  const { token, email, mobileNumber, password } = req.body;
  const profilePicture = req.file;

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already in use' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with default userType
    const newUser = new User({
      email,
      mobileNumber,
      password: hashedPassword, // Save hashed password
      userType: 'user', // Default user type
      profilePicture: profilePicture ? profilePicture.path : 'default-profile.png',
    });

    await newUser.save();

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: newUser._id, userType: newUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ message: 'User created successfully', token: jwtToken });
  } catch (error) {
    console.error('Error during registration:', error); // Add detailed logging
    res.status(500).json({ message: 'Server error' });
  }
});


// Login Route
router.post('/login', async (req, res) => {
  const { token } = req.body;

  try {
    console.log('Received token:', token); // Log the received token

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Decoded token:', decodedToken); // Log the decoded token

    const email = decodedToken.email;

    // Find user by email
    let user = await User.findOne({ email });
    if (!user) {
      // If user does not exist, create a new user
      user = new User({
        email,
        mobileNumber: 'N/A', // Provide a default value for mobileNumber
        password: 'N/A', // Provide a default value for password
        userType: 'user', // Default user type
        profilePicture: decodedToken.picture || 'default-profile.png',
      });
      await user.save();
      console.log('New user created:', user);
    }

    // Generate JWT token with userType
    const jwtToken = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    // Log the error message for debugging
    console.error('Error during login:', error);

    res.status(500).json({ message: 'Server error' });
  }
});

// Protected Dashboard Route
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password'); // Use `req.user` set by authMiddleware
    res.json({ message: 'Welcome to your dashboard!', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const adminMiddleware = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

module.exports = router;