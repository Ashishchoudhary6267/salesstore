const express = require('express');
const { auth, admin } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// POST /api/orders - create order from current user's cart
router.post('/', auth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.cart || user.cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const { shippingAddress, paymentMethod = 'cod' } = req.body;

    const subtotal = user.cart.subtotal || 0;
    const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10%
    const shipping = subtotal > 100 ? 0 : 10; // simple rule
    const total = subtotal + tax + shipping;

    const order = await Order.create({
      user: user._id,
      items: user.cart.items,
      subtotal,
      tax,
      shipping,
      total,
      status: 'pending',
      shippingAddress,
      payment: {
        method: paymentMethod
      }
    });

    // clear cart
    user.cart = { items: [], subtotal: 0 };
    await user.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders - list current user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders/:id - get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ADMIN ROUTES ==========

// GET /api/orders/admin/all - get all orders (admin only)
router.get('/admin/all', auth, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      orders,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/orders/admin/:id/status - update order status (admin only)
router.put('/admin/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    res.json(order);
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
