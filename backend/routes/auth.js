const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Middleware to authenticate JWT tokens
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization'); // Token sent in the Authorization header

  // Check if no token is provided
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // Attach user ID from token payload to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Register Route
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  try {
    // Check if email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already in use' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already in use' });

    // Create new user with default userType
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password,
      userType: 'user', // Default user type
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid username or password' });

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

    // Generate JWT token with userType
    const token = jwt.sign(
      { userId: user._id, userType: user.userType }, // Add userType to token payload
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token });
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
