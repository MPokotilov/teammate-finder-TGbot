const cron = require('node-cron');
const Match = require('../models/Match');

const REVIEW_DELAY_MS = 172800000;

function setupCron(bot) {
  cron.schedule('*/10 * * * *', async () => {
    console.log('CRON: Проверяем матчи на запрос отзыва...');
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - REVIEW_DELAY_MS);
    const matchesToReview = await Match.find({ matchedAt: { $lte: twoDaysAgo }, reviewRequested: false });

    for (const match of matchesToReview) {
      try {
        await bot.telegram.sendMessage(match.userA, '2 суток прошло с момента вашего матча. Пожалуйста, оцените опыт игры с вашим тиммейтом от 1 до 5 и напишите короткий комментарий (или "Пропустить")');
        await bot.telegram.sendMessage(match.userB, '2 суток прошло с момента вашего матча. Пожалуйста, оцените опыт игры с вашим тиммейтом от 1 до 5 и напишите короткий комментарий (или "Пропустить")');
        match.reviewRequested = true;
        await match.save();
      } catch (err) {
        console.error('Ошибка при запросе отзыва:', err);
      }
    }
  });
}

module.exports = { setupCron };
