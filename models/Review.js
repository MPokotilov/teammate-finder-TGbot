const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerUserId: Number,
  reviewedUserId: Number,
  rating: Number,
  comment: String,
});

module.exports = mongoose.model('Review', reviewSchema);
