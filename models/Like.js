const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  likerId: { type: Number, required: true },
  likedId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

likeSchema.index({ likerId: 1, likedId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
