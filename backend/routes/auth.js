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
  const { token, name, email, mobileNumber, password, fcmToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firebaseUid,
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      profilePicture: req.file ? req.file.path : null,
      fcmToken, // Save FCM token
    });

    await newUser.save();

    const jwtToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ message: 'User created successfully', token: jwtToken });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// router.post('/login', async (req, res) => {
//   const { email, password, fcmToken } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     user.fcmToken = fcmToken; // Update FCM token
//     await user.save();

//     const jwtToken = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.status(200).json({ message: 'Login successful', token: jwtToken });
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Login Route Google
// Login Route Google
router.post('/login', async (req, res) => {
  const { email, password, token } = req.body; // Removed fcmToken from request body

  try {
    let user;
    let decodedToken;

    if (token) {
      // Google login
      console.log('Google login attempt with token:', token);
      decodedToken = await admin.auth().verifyIdToken(token);
      const googleEmail = decodedToken.email;
      console.log('Decoded Google token email:', googleEmail);

      // Find user by email
      user = await User.findOne({ email: googleEmail });

      if (!user) {
        // If user doesn't exist, create a new user for Google login
        console.log('Creating new user for Google login');
        user = new User({
          name: decodedToken.name || 'GoogleUser',
          email: googleEmail,
          mobileNumber: 'N/A',
          password: 'N/A', // Google login does not use a password
          userType: 'user',
          profilePicture: decodedToken.picture || 'default-profile.png',
        });
        await user.save();
      }
    } else {
      // Email/password login
      console.log('Email/password login attempt with email:', email);
      user = await User.findOne({ email });
      if (!user) {
        console.log('User not found for email:', email);
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Password mismatch for email:', email);
        return res.status(400).json({ message: 'Invalid email or password' });
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for email:', user.email);

    // Include userId and other relevant details in the response
    res.json({
      token: jwtToken,
      userId: user._id, // Add userId here
      email: user.email, // Optionally include email or other user info
    });
  } catch (error) {
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