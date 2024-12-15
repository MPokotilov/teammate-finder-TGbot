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
  
  async function sendUserProfileInfo(bot, userId, user, showLikeButton = false, likeUserId = null) {
    let response = `<b>👤 @${escapeHTML(user.username) || 'не указан'}</b>\n`;
    response += `<b>Возраст:</b> ${user.age}\n`;
    response += `<b>Пол:</b> ${user.gender}\n`;
    response += `<b>Игры и ранги:</b>\n`;
    if (user.gameRanks && user.gameRanks.length > 0) {
      user.gameRanks.forEach((gr) => {
        response += `• ${gr.game}: ${gr.rank || 'Не указан'}\n`;
      });
    } else {
      response += 'Нет информации об играх и рангах.\n';
    }
    response += `<b>Время игры:</b> ${user.playTime.join(', ')}\n`;
    response += `<b>Язык:</b> ${user.language.join(', ')}\n`;
    response += `<b>Часовой пояс:</b> ${user.timeZone}\n`;
    response += `<b>Программы для общения:</b> ${user.communicationTool.join(', ')}\n`;
  
    let extra = { parse_mode: 'HTML' };
    if (showLikeButton && likeUserId) {
      extra.reply_markup = {
        inline_keyboard: [
          [{ text: 'Понравился профиль', callback_data: `like_profile_${likeUserId}` }]
        ]
      };
    }
  
    await bot.telegram.sendMessage(userId, response, extra);
  }
  
  module.exports = { sendUserProfileInfo, escapeHTML };
  