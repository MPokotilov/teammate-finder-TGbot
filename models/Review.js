const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerUserId: { type: Number, required: true },
  reviewedUserId: { type: Number, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
