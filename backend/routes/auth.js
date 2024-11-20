const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../firebaseAdmin');
const bcrypt = require('bcryptjs'); // Import bcrypt
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
router.post('/register', async (req, res) => {
  const { token, firstName, lastName, username, password } = req.body;

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already in use' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already in use' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with default userType
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword, // Save hashed password
      userType: 'user', // Default user type
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
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    // Generate JWT token with userType
    const jwtToken = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    console.error(error);
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