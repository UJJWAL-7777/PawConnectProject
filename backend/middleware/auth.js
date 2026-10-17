const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT token from Authorization header or cookie
const protect = async (req, res, next) => {
  let token;

  // Check Bearer token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && (req.cookies.token || req.cookies.pawconnect_token)) {
    // Check cookie fallback
    token = req.cookies.token || req.cookies.pawconnect_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'pawconnect_jwt_secret_key_2026_dev'
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user not found',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid or expired token',
    });
  }
};

// Authorize by user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Admin has universal access
    if (req.user.role === 'Admin') {
      return next();
    }

    // Role mapping: Seller and Rescuer can share listing/selling abilities
    const userRole = req.user.role;
    const isAllowed =
      roles.includes(userRole) ||
      (roles.includes('Seller') && (userRole === 'Rescuer' || userRole === 'ShelterAdmin')) ||
      (roles.includes('Rescuer') && userRole === 'Seller');

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Role '${userRole}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

// Check if user is verified before listing pets or selling
const verifiedSellerOnly = (req, res, next) => {
  if (req.user.role === 'Admin' || req.user.role === 'ShelterAdmin') {
    return next();
  }

  if ((req.user.role === 'Seller' || req.user.role === 'Rescuer') && !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Your seller account is pending admin verification. You will be notified once approved.',
    });
  }

  next();
};

module.exports = { protect, authorize, verifiedSellerOnly };
