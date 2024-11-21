const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', ''); // Extract token
  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token
    req.user = { id: decoded.userId, userType: decoded.userType }; // Attach user ID and type to req.user
    next();
  } catch (err) {
    console.error('Token validation error:', err.message); // Log error for debugging
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
