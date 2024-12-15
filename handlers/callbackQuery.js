const Review = require('../models/Review');
const { checkForMatch } = require('../utils/helpers');

function setupCallbackQueryHandler(bot) {
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (data.startsWith('view_reviews_')) {
      const reviewedUserId = parseInt(data.split('_')[2], 10);
      const reviews = await Review.find({ reviewedUserId }).populate('reviewerUserId');
      if (reviews.length === 0) {
        await ctx.reply('У этого пользователя пока нет отзывов.');
      } else {
        let response = 'Отзывы о пользователе:\n';
        reviews.forEach((review) => {
          const username = review.reviewerUserId ? `@${review.reviewerUserId.username || 'не указан'}` : 'не указан';
          response += `\nОт ${username}: ${review.rating}/5\n"${review.comment || 'Без комментария'}"\n`;
        });
        await ctx.reply(response);
      }
    } else if (data.startsWith('like_profile_')) {
      const likedUserId = parseInt(data.split('_')[2], 10);
      const likerId = ctx.from.id;
      await checkForMatch(bot, likerId, likedUserId);
      await ctx.reply('Вы отметили, что профиль вам понравился!');
    }
  });
}

module.exports = { setupCallbackQueryHandler };
