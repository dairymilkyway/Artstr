const jwt = require('jsonwebtoken');

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

module.exports = authMiddleware;
