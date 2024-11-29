const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: String,
  age: Number,
  gender: String,
  gameRanks: [
    {
      game: String,
      rank: String
    }
  ],
  playTime: [String],
  language: [String],
  timeZone: String,
  communicationTool: [String],
});

module.exports = mongoose.model('User', userSchema);
