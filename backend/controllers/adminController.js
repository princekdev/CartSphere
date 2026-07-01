const Order   = require('../models/Order');
const User    = require('../models/User');
const Product = require('../models/Product');
const { isAdminEmail } = require('../middleware/authMiddleware');

/* ── GET /api/admin/dashboard ────────────────────────────────── */
const getDashboard = async (req, res) => {
  try {
    const sixMonthsAgo  = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalProducts, totalOrders,
      revenueAgg, recentOrders, ordersByStatus,
      topProducts, monthlyRevenue, lowStockProducts, newUsersThisMonth
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } }
      ]),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(8),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', title: { $first: '$items.title' }, sales: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { sales: -1 } }, { $limit: 5 }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, revenue: { $sum: '$grandTotal' }, orders: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Product.find({ stock: { $lt: 5 } }).select('title stock category images').sort({ stock: 1 }).limit(10),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalProducts, totalOrders, totalRevenue: revenueAgg[0]?.total || 0, newUsersThisMonth },
      recentOrders, ordersByStatus, topProducts, monthlyRevenue, lowStockProducts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/admin/orders ───────────────────────────────────── */
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query)
    ]);
    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── PUT /api/admin/orders/:id ───────────────────────────────── */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, message } = req.body;
    const valid = ['processing','confirmed','shipped','out_for_delivery','delivered','cancelled'];
    if (!valid.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.orderStatus = orderStatus;
    order.statusHistory.push({ status: orderStatus, message: message || `Order ${orderStatus}`, timestamp: new Date() });
    if (orderStatus === 'delivered') { order.deliveredAt = new Date(); order.paymentStatus = 'paid'; }
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/admin/users ────────────────────────────────────── */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ]);
    // Attach live isAdmin flag
    const enriched = users.map(u => ({ ...u.toObject(), isAdmin: isAdminEmail(u.email) }));
    res.json({ success: true, users: enriched, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── PUT /api/admin/users/:id/toggle-active ──────────────────── */
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (isAdminEmail(user.email)) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate the admin account' });
    }
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, isActive: user.isActive, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getAllOrders, updateOrderStatus, getAllUsers, toggleUserActive };
