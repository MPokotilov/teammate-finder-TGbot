const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userA: { type: Number, required: true },
  userB: { type: Number, required: true },
  matchedAt: { type: Date, default: Date.now },
  reviewRequested: { type: Boolean, default: false }
});

matchSchema.index({ userA: 1, userB: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
