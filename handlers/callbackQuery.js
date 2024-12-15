const Review = require('../models/Review');
const { checkForMatch } = require('../utils/helpers');
const User = require('../models/User');

function setupCallbackQueryHandler(bot) {
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (data.startsWith('view_reviews_')) {
      const reviewedUserId = parseInt(data.split('_')[2], 10);
      const reviewedUser = await User.findOne({ telegramId: reviewedUserId }).exec();
      let reviewedUsername = 'не указан';
      if (reviewedUser) {
        if (reviewedUser.username && reviewedUser.username.trim() !== '') {
          reviewedUsername = `@${reviewedUser.username}`;
        } else {
          reviewedUsername = `@id${reviewedUser.telegramId}`;
        }
      }
      const reviews = await Review.find({ reviewedUserId }).exec();
      if (reviews.length === 0) {
        await ctx.reply(`У этого пользователя (${reviewedUsername}) пока нет отзывов.`);
      } else {
        let response = `Отзывы о пользователе (${reviewedUsername}):\n`;
        for (const review of reviews) {
          const userObj = await User.findOne({ telegramId: review.reviewerUserId }).exec();
          let reviewerName = 'не указан';
          if (userObj) {
            if (userObj.username && userObj.username.trim() !== '') {
              reviewerName = `@${userObj.username}`;
            } else {
              reviewerName = `@id${userObj.telegramId}`;
            }
          }
          response += `\nОт ${reviewerName}: ${review.rating}/5\n"${review.comment || 'Без комментария'}"\n`;
        }
        await ctx.reply(response);
      }
    } else if (data.startsWith('like_profile_')) {
      const likedUserId = parseInt(data.split('_')[2], 10);
      const likerId = ctx.from.id;
      await checkForMatch(bot, likerId, likedUserId);
      await ctx.reply('Вы отметили, что профиль вам понравился!');
    } else if (data.startsWith('rate_')) {
      const parts = data.split('_');
      const userA = parseInt(parts[1], 10);
      const userB = parseInt(parts[2], 10);
      const rating = parseInt(parts[3], 10);

      ctx.session = ctx.session || {};
      ctx.session.waitingForCommentChoice = true;
      ctx.session.rating = rating;
      ctx.session.matchPair = `${userA}_${userB}`;

      await ctx.reply('Хотите написать короткий комментарий об опыте игры?', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Да', callback_data: `comment_yes_${userA}_${userB}_${rating}` },
             { text: 'Нет', callback_data: `comment_no_${userA}_${userB}_${rating}` }]
          ]
        }
      });
    } else if (data.startsWith('comment_yes_')) {
      const parts = data.split('_');
      const userA = parseInt(parts[2], 10);
      const userB = parseInt(parts[3], 10);
      const rating = parseInt(parts[4], 10);
      ctx.session = ctx.session || {};
      ctx.session.waitingForComment = true;
      ctx.session.rating = rating;
      ctx.session.matchPair = `${userA}_${userB}`;
      ctx.session.waitingForCommentChoice = false;
      await ctx.reply('Напишите ваш комментарий:');
    } else if (data.startsWith('comment_no_')) {
      const parts = data.split('_');
      const userA = parseInt(parts[2], 10);
      const userB = parseInt(parts[3], 10);
      const rating = parseInt(parts[4], 10);
      const fromId = ctx.from.id;

      let reviewedUserId = (fromId === userA) ? userB : userA;
      const review = new Review({
        reviewerUserId: fromId,
        reviewedUserId,
        rating,
        comment: ''
      });
      await review.save();

      await ctx.reply('Спасибо за ваш отзыв!');
      ctx.session.rating = null;
      ctx.session.matchPair = null;
      ctx.session.waitingForCommentChoice = false;
    }
  });

  bot.on('text', async (ctx, next) => {
    ctx.session = ctx.session || {};
    if (ctx.session.waitingForComment) {
      const comment = ctx.message.text;
      const [userA, userB] = ctx.session.matchPair.split('_').map(id => parseInt(id, 10));
      let reviewedUserId = (ctx.from.id === userA) ? userB : userA;
      const review = new Review({
        reviewerUserId: ctx.from.id,
        reviewedUserId,
        rating: ctx.session.rating,
        comment,
      });
      await review.save();
      await ctx.reply('Спасибо за ваш отзыв!');
      ctx.session.waitingForComment = false;
      ctx.session.rating = null;
      ctx.session.matchPair = null;
    } else {
      return next();
    }
  });
}

module.exports = { setupCallbackQueryHandler };
