const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  orderNumber: {
    type: String,
    default: ''
  },
  itemReviewed: {
    type: String,
    default: 'General Service'
  },
  rating: {
    type: Number,
    required: [true, 'Rating between 1 and 5 is required'],
    min: 1,
    max: 5
  },
  category: {
    type: String,
    enum: ['Food Quality', 'Service Speed', 'Cleanliness', 'Portion Size', 'Value for Money', 'Other'],
    default: 'Food Quality'
  },
  comment: {
    type: String,
    trim: true,
    required: [true, 'Feedback comment is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

