const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Helper to send token response with secure cookies
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res
    .status(statusCode)
    .cookie('pawconnect_refresh_token', refreshToken, cookieOptions)
    .cookie('pawconnect_token', token, {
      ...cookieOptions,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    })
    .json({
      success: true,
      message,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isBanned: user.isBanned,
        favorites: user.favorites || [],
        token,
      },
    });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, avatar } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with that email already exists',
      });
    }

    // Default verification: Sellers need admin approval, others are verified
    const isVerified = role === 'Admin' || role === 'Adopter';

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Adopter',
      phone: phone || '',
      address: address || {},
      avatar: avatar || '',
      isVerified,
    });

    sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform support.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookies
// @route   POST /api/v1/auth/logout
// @access  Public
const logout = async (req, res, next) => {
  try {
    res.cookie('pawconnect_refresh_token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
    });
    res.cookie('pawconnect_token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken =
      req.cookies?.pawconnect_refresh_token || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'pawconnect_jwt_refresh_secret_key_2026'
    );
    const user = await User.findById(decoded.id);

    if (!user || user.isBanned) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token or user suspended',
      });
    }

    const newAccessToken = user.getSignedJwtToken();

    res.json({
      success: true,
      data: {
        token: newAccessToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token expired or invalid',
    });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('adoptedPets')
      .populate('favorites')
      .populate('shelterId');

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/v1/auth/me
// @access  Private
const updateMe = async (req, res, next) => {
  try {
    const { name, phone, address, avatar } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (address !== undefined) fieldsToUpdate.address = address;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email',
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/reset-password/${resetToken}`;

    const message = `You have requested a password reset. Please use the following link or token to reset your password:\n\n${resetUrl}\n\nReset token: ${resetToken}\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'PawConnect: Password Reset Request',
        text: message,
      });

      res.json({
        success: true,
        message: 'Password reset link sent to email',
        // Provide token in response in dev mode for ease of testing
        resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateMe,
  forgotPassword,
  resetPassword,
};
