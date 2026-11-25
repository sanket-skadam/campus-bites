const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    enum: ['Breakfast', 'Meals & Thali', 'Snacks', 'Beverages', 'Dessert'],
    default: 'Snacks'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: '🍽️'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'
  },
  prepTimeMinutes: {
    type: Number,
    default: 10
  },
  ingredients: [
    {
      ingredientName: { type: String, required: true },
      quantityNeeded: { type: Number, required: true },
      unit: { type: String, default: 'kg' }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);

