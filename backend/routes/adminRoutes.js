const express = require('express');
const { getDashboard, getAllOrders, updateOrderStatus, getAllUsers, toggleUserActive } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Every admin route requires: 1) valid JWT, 2) email === ADMIN_EMAIL
router.use(protect, adminOnly);

router.get('/dashboard',                     getDashboard);
router.get('/orders',                        getAllOrders);
router.put('/orders/:id',                    updateOrderStatus);
router.get('/users',                         getAllUsers);
router.put('/users/:id/toggle-active',       toggleUserActive);

module.exports = router;
