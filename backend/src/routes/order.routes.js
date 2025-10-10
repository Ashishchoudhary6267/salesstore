const express = require('express');
const { auth } = require('../middleware/auth');
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
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
