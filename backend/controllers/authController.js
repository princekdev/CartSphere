const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { isAdminEmail } = require('../middleware/authMiddleware');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });

const buildUserPayload = (user) => ({
  _id:     user._id,
  name:    user.name,
  email:   user.email,
  isAdmin: isAdminEmail(user.email)   // derived live from env
});

/* ── POST /api/auth/register ─────────────────────────────────── */
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      // Agar yeh ADMIN_EMAIL hai aur account pehle se ban chuka hai,
      // to isko dobara register nahi hone dena — reserved rakho.
      if (isAdminEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'This email address is reserved. Please use a different email.'
        });
      }
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // ADMIN_EMAIL abhi tak DB me exist nahi karta — pehli baar isi register
    // form se admin account create hone do. Iske baad upar wala "already
    // registered" check isko dobara register hone se rok dega.
    const user = await User.create({ name, email: email.toLowerCase(), password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: isAdminEmail(email) ? 'Admin account created successfully' : 'Account created successfully',
      token,
      user: buildUserPayload(user)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /api/auth/login ────────────────────────────────────── */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }

    // Update isAdmin flag in DB to stay in sync
    const adminFlag = isAdminEmail(user.email);
    if (user.isAdmin !== adminFlag) {
      user.isAdmin = adminFlag;
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: adminFlag ? 'Welcome back, Admin!' : 'Login successful',
      token,
      user: buildUserPayload(user)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/auth/profile ───────────────────────────────────── */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'title price images');
    res.json({
      success: true,
      user: { ...user.toObject(), isAdmin: isAdminEmail(user.email) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── PUT /api/auth/profile ───────────────────────────────────── */
const updateProfile = async (req, res) => {
  try {
    const { name, addresses } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, addresses },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user: { ...user.toObject(), isAdmin: isAdminEmail(user.email) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /api/auth/wishlist/:productId ──────────────────────── */
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.productId;
    const idx = user.wishlist.indexOf(pid);
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(pid);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, toggleWishlist };