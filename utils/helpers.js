const User = require('../models/User');
const Like = require('../models/Like');
const Match = require('../models/Match');
const { sendUserProfileInfo } = require('./helpers_sendProfileInfo');

async function checkForMatch(bot, likerId, likedId) {
  try {
    await Like.create({ likerId, likedId });
  } catch (err) {
    console.log('Ошибка при сохранении лайка (возможно уже есть лайк):', err);
  }

  const reverseLike = await Like.findOne({ likerId: likedId, likedId: likerId });
  if (reverseLike) {
    let userA = Math.min(likerId, likedId);
    let userB = Math.max(likerId, likedId);
    let match = await Match.findOne({ userA, userB });
    if (!match) {
      match = await Match.create({ userA, userB });
      await bot.telegram.sendMessage(likerId, 'Поздравляем! У вас взаимный лайк с игроком. Через 2 суток мы попросим вас оценить опыт игры друг с другом.');
      await bot.telegram.sendMessage(likedId, 'Поздравляем! У вас взаимный лайк с игроком. Через 2 суток мы попросим вас оценить опыт игры друг с другом.');
    }
  } else {
    const likedUser = await User.findOne({ telegramId: likedId }).exec();
    const likerUser = await User.findOne({ telegramId: likerId }).exec();
    if (likedUser && likerUser) {
      await bot.telegram.sendMessage(likedId, `Ваш профиль понравился @${likerUser.username || 'не указан'}! Вот его профиль:`, { parse_mode: 'HTML' });
      await sendUserProfileInfo(bot, likedId, likerUser, true, likerUser.telegramId);
    }
  }
}

module.exports = { checkForMatch };
