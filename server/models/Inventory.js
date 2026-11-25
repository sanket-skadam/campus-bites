const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    unique: true,
    trim: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'kg'
  },
  reorderThreshold: {
    type: Number,
    default: 10
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Stable', 'Reorder soon', 'Low stock', 'Critical'],
    default: 'Stable'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Middleware to calculate status based on currentStock vs reorderThreshold
inventorySchema.pre('save', function() {
  if (this.currentStock <= this.reorderThreshold * 0.5) {
    this.status = 'Low stock';
  } else if (this.currentStock <= this.reorderThreshold) {
    this.status = 'Reorder soon';
  } else {
    this.status = 'Stable';
  }
  this.lastUpdated = Date.now();
});

module.exports = mongoose.model('Inventory', inventorySchema);

