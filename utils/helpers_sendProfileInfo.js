const { getText } = require('./i18n');

function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"]/g, (tag) => {
    const charsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    };
    return charsToReplace[tag] || tag;
  });
}

async function sendUserProfileInfo(bot, userId, user, ctx, showLikeButton = false, likeUserId = null) {
  const lang = ctx.session?.language || 'en';

  let response = `<b>👤 @${escapeHTML(user.username) || getText(ctx, 'username_not_specified')}</b>\n`;
  response += `<b>${getText(ctx, 'profile_age')}:</b> ${user.age}\n`;
  response += `<b>${getText(ctx, 'profile_gender')}:</b> ${user.gender}\n`;
  response += `<b>${getText(ctx, 'profile_games_and_ranks')}:</b>\n`;

  if (user.gameRanks && user.gameRanks.length > 0) {
    user.gameRanks.forEach((gr) => {
      response += `• ${gr.game}: ${gr.rank || getText(ctx, 'profile_rank_not_specified')}\n`;
    });
  } else {
    response += `${getText(ctx, 'profile_no_game_info')}\n`;
  }

  response += `<b>${getText(ctx, 'profile_playtime')}:</b> ${user.playTime.join(', ')}\n`;
  response += `<b>${getText(ctx, 'profile_language')}:</b> ${user.language.join(', ')}\n`;
  response += `<b>${getText(ctx, 'profile_timezone')}:</b> ${user.timeZone}\n`;
  response += `<b>${getText(ctx, 'profile_communication_tools')}:</b> ${user.communicationTool.join(', ')}\n`;

  let extra = { parse_mode: 'HTML' };
  if (showLikeButton && likeUserId) {
    extra.reply_markup = {
      inline_keyboard: [
        [{ text: getText(ctx, 'like_profile_button'), callback_data: `like_profile_${likeUserId}` }]
      ]
    };
  }

  await bot.telegram.sendMessage(userId, response, extra);
}

module.exports = { sendUserProfileInfo, escapeHTML };
