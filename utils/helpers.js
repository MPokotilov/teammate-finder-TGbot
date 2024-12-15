const User = require('../models/User');
const Like = require('../models/Like');
const Match = require('../models/Match');
const { sendUserProfileInfo } = require('./helpers_sendProfileInfo');
const { getText } = require('./i18n');

async function checkForMatch(bot, likerId, likedId, ctx) {
  const lang = ctx.session?.language || 'en';

  const existingLike = await Like.findOne({ likerId, likedId });
  if (!existingLike) {
    try {
      await Like.create({ likerId, likedId });
    } catch (err) {
      console.log(getText(ctx, 'like_error_duplicate'), err);
    }
  }

  const reverseLike = await Like.findOne({ likerId: likedId, likedId: likerId });
  if (reverseLike) {
    let userA = Math.min(likerId, likedId);
    let userB = Math.max(likerId, likedId);
    let match = await Match.findOne({ userA, userB });
    if (!match) {
      match = await Match.create({ userA, userB });
      await bot.telegram.sendMessage(
        likerId,
        getText(ctx, 'match_found_message')
      );
      await bot.telegram.sendMessage(
        likedId,
        getText(ctx, 'match_found_message')
      );
    }
  } else {
    const likedUser = await User.findOne({ telegramId: likedId }).exec();
    const likerUser = await User.findOne({ telegramId: likerId }).exec();
    if (likedUser && likerUser) {
      await bot.telegram.sendMessage(
        likedId,
        getText(ctx, 'profile_liked_notification', { username: likerUser.username || getText(ctx, 'username_not_specified') }),
        { parse_mode: 'HTML' }
      );
      await sendUserProfileInfo(bot, likedId, likerUser, ctx, true, likerUser.telegramId);
    }
  }
}

module.exports = { checkForMatch };
