const mongoose = require('mongoose');

const wasteLogSchema = new mongoose.Schema({
  item: {
    type: String,
    required: [true, 'Item name is required']
  },
  quantityKg: {
    type: Number,
    required: [true, 'Quantity in kg is required'],
    min: 0.1
  },
  reason: {
    type: String,
    enum: ['Over-preparation', 'Expired', 'Damaged / spoiled', 'Customer leftovers', 'Other'],
    required: true
  },
  disposalMethod: {
    type: String,
    enum: ['Composting', 'Biowaste collection', 'Other'],
    default: 'Composting'
  },
  staffName: {
    type: String,
    default: 'Canteen Staff'
  },
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WasteLog', wasteLogSchema);

