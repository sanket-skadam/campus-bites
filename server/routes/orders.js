const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');
const { protect, authorize } = require('../middleware/auth');

const MAX_SLOT_CAPACITY = 10;
const ALL_SLOTS = [
  '12:00–12:15 PM',
  '12:15–12:30 PM',
  '12:30–12:45 PM',
  '12:45–01:00 PM',
  '01:00–01:15 PM',
  '01:15–01:30 PM'
];

// @route   GET /api/orders/slots/availability
// @desc    Get real-time booking count & remaining capacity for each pickup slot today
// @access  Public
router.get('/slots/availability', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group active orders today by pickupSlot
    const slotCounts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          orderStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: '$pickupSlot',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = slotCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const availability = ALL_SLOTS.map((slot) => {
      const booked = countMap[slot] || 0;
      const remaining = Math.max(0, MAX_SLOT_CAPACITY - booked);
      return {
        slot,
        booked,
        maxCapacity: MAX_SLOT_CAPACITY,
        remaining,
        isFull: remaining === 0
      };
    });

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Place a new pre-order with slot capacity enforcement
// @access  Private (Students & College Staff)
router.post('/', protect, async (req, res) => {
  try {
    const { items, pickupSlot, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!pickupSlot) {
      return res.status(400).json({ message: 'Pickup slot is required' });
    }

    // Verify slot capacity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slotBookings = await Order.countDocuments({
      createdAt: { $gte: today },
      pickupSlot,
      orderStatus: { $ne: 'Cancelled' }
    });

    if (slotBookings >= MAX_SLOT_CAPACITY) {
      return res.status(400).json({
        message: `Pickup slot '${pickupSlot}' is fully booked (${MAX_SLOT_CAPACITY}/${MAX_SLOT_CAPACITY}). Please select an alternate slot.`
      });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Generate readable orderNumber
    const count = await Order.countDocuments();
    const orderNumber = `#SC${1001 + count}`;
    const paymentStatus = paymentMethod === 'Pay at pickup' ? 'Due at pickup' : 'Paid';

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      userName: req.user.name,
      items,
      totalAmount,
      pickupSlot,
      paymentMethod: paymentMethod || 'Pay at pickup',
      paymentStatus,
      orderStatus: 'Received',
      stockDeducted: false
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/my
// @desc    Get orders placed by currently logged-in user
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Kitchen Queue)
// @access  Private (Canteen Staff only)
router.get('/', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') {
      query.orderStatus = status;
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status + Auto-deduct recipe inventory upon completion
// @access  Private (Canteen Staff only)
router.patch('/:id/status', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // Automatic Recipe-Based Stock Deduction upon Order Completion
    if (orderStatus === 'Completed' && !order.stockDeducted) {
      for (const orderItem of order.items) {
        if (orderItem.menuItem) {
          const menuItemDoc = await MenuItem.findById(orderItem.menuItem);
          if (menuItemDoc && menuItemDoc.ingredients && menuItemDoc.ingredients.length > 0) {
            for (const ing of menuItemDoc.ingredients) {
              const totalRequired = ing.quantityNeeded * orderItem.quantity;
              const inventoryItem = await Inventory.findOne({ name: new RegExp(`^${ing.ingredientName}$`, 'i') });
              if (inventoryItem) {
                inventoryItem.currentStock = Math.max(0, Number((inventoryItem.currentStock - totalRequired).toFixed(2)));
                await inventoryItem.save();
                console.log(`[Auto-Deduction] Deducted ${totalRequired} ${ing.unit} of ${inventoryItem.name} for ${order.orderNumber}`);
              }
            }
          }
        }
      }
      order.stockDeducted = true;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Student cancels order before preparation starts
// @access  Private
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'Received') {
      return res.status(400).json({
        message: `Cannot cancel order in '${order.orderStatus}' state. Only 'Received' orders can be cancelled.`
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();
    res.json({ message: 'Order successfully cancelled', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/analytics/summary
// @desc    Get daily summary stats for canteen dashboard
// @access  Private (Canteen Staff only)
router.get('/analytics/summary', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = await Order.find({ createdAt: { $gte: today } });
    const totalOrders = ordersToday.filter(o => o.orderStatus !== 'Cancelled').length;
    const totalRevenue = ordersToday
      .filter(o => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const activeKitchenOrders = ordersToday.filter(o => ['Received', 'Preparing'].includes(o.orderStatus)).length;

    res.json({
      totalOrders,
      totalRevenue,
      activeKitchenOrders,
      recentOrders: ordersToday.slice(0, 6)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
