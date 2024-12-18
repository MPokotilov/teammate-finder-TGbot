const cron = require('node-cron');
const Match = require('../models/Match');
const User = require('../models/User');

const REVIEW_DELAY_MS = 30000;

function setupCron(bot) {
  cron.schedule('*/10 * * * *', async () => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - REVIEW_DELAY_MS);
    const matchesToReview = await Match.find({ matchedAt: { $lte: twoDaysAgo }, reviewRequested: false });

    for (const match of matchesToReview) {
      try {
        const userAData = await User.findOne({ telegramId: match.userA });
        const userBData = await User.findOne({ telegramId: match.userB });

        const usernameA = userAData && userAData.username ? `@${userAData.username}` : 'не указан';
        const usernameB = userBData && userBData.username ? `@${userBData.username}` : 'не указан';

        await bot.telegram.sendMessage(match.userA, `2 суток прошло с момента вашего матча с ${usernameB}. Пожалуйста, оцените опыт игры от 1 до 5:`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '1', callback_data: `rate_${match.userA}_${match.userB}_1` },
               { text: '2', callback_data: `rate_${match.userA}_${match.userB}_2` },
               { text: '3', callback_data: `rate_${match.userA}_${match.userB}_3` },
               { text: '4', callback_data: `rate_${match.userA}_${match.userB}_4` },
               { text: '5', callback_data: `rate_${match.userA}_${match.userB}_5` }]
            ]
          }
        });

        await bot.telegram.sendMessage(match.userB, `2 суток прошло с момента вашего матча с ${usernameA}. Пожалуйста, оцените опыт игры от 1 до 5:`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '1', callback_data: `rate_${match.userA}_${match.userB}_1` },
               { text: '2', callback_data: `rate_${match.userA}_${match.userB}_2` },
               { text: '3', callback_data: `rate_${match.userA}_${match.userB}_3` },
               { text: '4', callback_data: `rate_${match.userA}_${match.userB}_4` },
               { text: '5', callback_data: `rate_${match.userA}_${match.userB}_5` }]
            ]
          }
        });

        match.reviewRequested = true;
        await match.save();
      } catch (err) {
        console.error('Ошибка при запросе отзыва:', err);
      }
    }
  });
}

module.exports = { setupCron };
