const jwt = require('jsonwebtoken');

// This function runs BEFORE any "protected" route.
// It checks for a valid JWT token in the request header.
// If valid, it attaches the decoded user info to req.user
// so the actual route handler can use it (e.g. req.user.id).
module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next(); // proceed to the actual route handler
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};