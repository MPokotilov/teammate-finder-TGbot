const Review = require('../models/Review');
const { checkForMatch } = require('../utils/helpers');
const User = require('../models/User');
const { getText } = require('../utils/i18n');

function setupCallbackQueryHandler(bot) {
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('view_reviews_')) {
      const parts = data.split('_');
      const reviewedUserId = parseInt(parts[2], 10);
      let page = 1;
      if (parts.length > 3) {
        page = parseInt(parts[3], 10);
      }

      const reviewedUser = await User.findOne({ telegramId: reviewedUserId }).exec();
      let reviewedUsername = getText(ctx, 'not_specified');
      if (reviewedUser) {
        if (reviewedUser.username && reviewedUser.username.trim() !== '') {
          reviewedUsername = `@${reviewedUser.username}`;
        } else {
          reviewedUsername = `@id${reviewedUser.telegramId}`;
        }
      }

      const reviews = await Review.find({ reviewedUserId }).exec();
      if (reviews.length === 0) {
        if (parts.length === 3) {
          await ctx.reply(getText(ctx, 'reviews_none', { username: reviewedUsername }));
        } else {
          await ctx.answerCbQuery(getText(ctx, 'reviews_no_pages'), { show_alert: true });
        }
      } else {
        const totalReviews = reviews.length;
        const reviewsPerPage = 5;
        const totalPages = Math.ceil(totalReviews / reviewsPerPage);
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        const start = (page - 1) * reviewsPerPage;
        const end = start + reviewsPerPage;
        const pageReviews = reviews.slice(start, end);

        let response = getText(ctx, 'reviews_header', {
          username: reviewedUsername,
          page,
          totalPages
        });
        for (const review of pageReviews) {
          const userObj = await User.findOne({ telegramId: review.reviewerUserId }).exec();
          let reviewerName = getText(ctx, 'not_specified');
          if (userObj) {
            if (userObj.username && userObj.username.trim() !== '') {
              reviewerName = `@${userObj.username}`;
            } else {
              reviewerName = `@id${userObj.telegramId}`;
            }
          }
          response += getText(ctx, 'review_entry', {
            reviewer: reviewerName,
            rating: review.rating,
            comment: review.comment || getText(ctx, 'no_comment')
          });
        }

        const inlineKeyboard = [];
        const navButtons = [];
        if (page > 1) {
          navButtons.push({ text: '◀', callback_data: `view_reviews_${reviewedUserId}_${page - 1}` });
        }
        if (page < totalPages) {
          navButtons.push({ text: '▶', callback_data: `view_reviews_${reviewedUserId}_${page + 1}` });
        }
        if (navButtons.length > 0) {
          inlineKeyboard.push(navButtons);
        }

        if (parts.length === 3) {
          await ctx.reply(response, {
            reply_markup: {
              inline_keyboard: inlineKeyboard
            },
            parse_mode: 'HTML'
          });
        } else {
          try {
            await ctx.editMessageText(response, {
              reply_markup: {
                inline_keyboard: inlineKeyboard
              },
              parse_mode: 'HTML'
            });
          } catch (e) {
            console.error('Error while editing review message:', e);
          }
        }
      }
      await ctx.answerCbQuery();
    } else if (data.startsWith('like_profile_')) {
      const likedUserId = parseInt(data.split('_')[2], 10);
      const likerId = ctx.from.id;
      await checkForMatch(bot, likerId, likedUserId);
      await ctx.reply(getText(ctx, 'profile_liked'));
      await ctx.answerCbQuery();
    } else if (data.startsWith('rate_')) {
      const parts = data.split('_');
      const userA = parseInt(parts[1], 10);
      const userB = parseInt(parts[2], 10);
      const rating = parseInt(parts[3], 10);

      ctx.session = ctx.session || {};
      ctx.session.waitingForCommentChoice = true;
      ctx.session.rating = rating;
      ctx.session.matchPair = `${userA}_${userB}`;

      await ctx.reply(getText(ctx, 'rate_comment_prompt'), {
        reply_markup: {
          inline_keyboard: [
            [
              { text: getText(ctx, 'yes'), callback_data: `comment_yes_${userA}_${userB}_${rating}` },
              { text: getText(ctx, 'no'), callback_data: `comment_no_${userA}_${userB}_${rating}` }
            ]
          ]
        }
      });
      await ctx.answerCbQuery();
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
      await ctx.reply(getText(ctx, 'comment_prompt'));
      await ctx.answerCbQuery();
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

      await ctx.reply(getText(ctx, 'thanks_for_review'));
      ctx.session.rating = null;
      ctx.session.matchPair = null;
      ctx.session.waitingForCommentChoice = false;
      await ctx.answerCbQuery();
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
      await ctx.reply(getText(ctx, 'thanks_for_review'));
      ctx.session.waitingForComment = false;
      ctx.session.rating = null;
      ctx.session.matchPair = null;
    } else {
      return next();
    }
  });
}

module.exports = { setupCallbackQueryHandler };
