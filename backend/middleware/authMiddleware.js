const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Check if an email matches the ADMIN_EMAIL env variable.
 * Case-insensitive comparison.
 */
const isAdminEmail = (email) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  return email.toLowerCase().trim() === adminEmail.toLowerCase().trim();
};

/**
 * protect — any authenticated user
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorised — no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    // Always re-derive isAdmin from the env email (so changing ADMIN_EMAIL takes effect)
    req.user = user;
    req.isAdmin = isAdminEmail(user.email);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or has expired' });
  }
};

/**
 * adminOnly — must come AFTER protect
 * Allows access only if the logged-in user's email matches ADMIN_EMAIL
 */
const adminOnly = (req, res, next) => {
  if (req.isAdmin) return next();
  return res.status(403).json({
    success: false,
    message: 'Access denied — admin privileges required'
  });
};

module.exports = { protect, adminOnly, isAdminEmail };
