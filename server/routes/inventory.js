const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/inventory
// @desc    Get all inventory items & stock levels
// @access  Private (Canteen Staff only)
router.get('/', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const items = await Inventory.find().sort({ currentStock: 1 });
    const lowStockCount = items.filter(i => ['Low stock', 'Critical', 'Reorder soon'].includes(i.status)).length;
    res.json({ items, lowStockCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/inventory
// @desc    Add a new inventory ingredient
// @access  Private (Canteen Staff only)
router.post('/', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const { name, currentStock, unit, reorderThreshold, expiryDate } = req.body;
    if (!name || currentStock === undefined || !expiryDate) {
      return res.status(400).json({ message: 'Name, stock, and expiry date are required' });
    }

    const item = await Inventory.create({
      name,
      currentStock: Number(currentStock),
      unit: unit || 'kg',
      reorderThreshold: Number(reorderThreshold) || 10,
      expiryDate: new Date(expiryDate)
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update stock quantity or details
// @access  Private (Canteen Staff only)
router.put('/:id', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (req.body.name) item.name = req.body.name;
    if (req.body.currentStock !== undefined) item.currentStock = Number(req.body.currentStock);
    if (req.body.unit) item.unit = req.body.unit;
    if (req.body.reorderThreshold !== undefined) item.reorderThreshold = Number(req.body.reorderThreshold);
    if (req.body.expiryDate) item.expiryDate = new Date(req.body.expiryDate);

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete an inventory item
// @access  Private (Canteen Staff only)
router.delete('/:id', protect, authorize('canteen_staff'), async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted from inventory' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

