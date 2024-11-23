const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: String,
  age: Number,
  games: [String],
  ranks: [String],
  playTime: [String],
  language: [String],
  communicationTool: [String],
});

module.exports = mongoose.model('User', userSchema);
