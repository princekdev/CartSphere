const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile, toggleWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], login);

router.get('/profile',              protect, getProfile);
router.put('/profile',              protect, updateProfile);
router.post('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
