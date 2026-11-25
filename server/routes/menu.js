const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/menu
// @desc    Get all available menu items (or all items if canteen staff)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, all } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    // If 'all' is not requested, only show available items for students
    if (all !== 'true') {
      query.isAvailable = true;
    }
    const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/menu
// @desc    Create a new menu item
// @access  Private (Canteen Staff only)
router.post('/', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const { name, description, price, category, icon, image, prepTimeMinutes, ingredients } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const item = await MenuItem.create({
      name,
      description: description || '',
      price: Number(price),
      category: category || 'Snacks',
      icon: icon || '🍽️',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      prepTimeMinutes: Number(prepTimeMinutes) || 10,
      ingredients: ingredients || []
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/menu/:id
// @desc    Update a menu item
// @access  Private (Canteen Staff only)
router.put('/:id', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/menu/:id/toggle
// @desc    Toggle item availability (Available vs Sold Out)
// @access  Private (Canteen Staff only)
router.patch('/:id/toggle', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete a menu item
// @access  Private (Canteen Staff only)
router.delete('/:id', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

