const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  pickupSlot: {
    type: String,
    required: [true, 'Pickup slot is required']
  },
  paymentMethod: {
    type: String,
    enum: ['Pay at pickup', 'UPI', 'Debit / Credit card'],
    default: 'Pay at pickup'
  },
  paymentStatus: {
    type: String,
    enum: ['Due at pickup', 'Paid', 'Awaiting confirmation'],
    default: 'Due at pickup'
  },
  orderStatus: {
    type: String,
    enum: ['Received', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'],
    default: 'Received'
  },
  stockDeducted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);

