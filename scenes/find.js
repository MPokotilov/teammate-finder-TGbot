const { Scenes, Markup } = require('telegraf');
const User = require('../models/User');
const Review = require('../models/Review');
const { escapeHTML } = require('../utils/helpers_sendProfileInfo');
const { getText } = require('../utils/i18n');
const { availableGames, gameRanks } = require('../utils/gameOptions.js');

const findWizard = new Scenes.WizardScene(
  'findWizard',
  async (ctx) => {
    ctx.wizard.state.searchCriteria = {};
    ctx.wizard.state.selectedGames = [];
    ctx.wizard.state.selectedRanks = [];
    await ctx.reply(
      getText(ctx, 'search_criteria_prompt'),
      Markup.keyboard([
        getText(ctx, 'search_game_prompt'),
        getText(ctx, 'search_rank_prompt'),
        getText(ctx, 'reg_gender_prompt'),
        getText(ctx, 'reg_playtime_prompt'),
        getText(ctx, 'reg_language_prompt'),
        getText(ctx, 'search'),
      ]).oneTime().resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply(getText(ctx, 'error_msg'));
      return;
    }
    const choice = ctx.message.text;
    if (choice === getText(ctx, 'search')) {
      if (Object.keys(ctx.wizard.state.searchCriteria).length === 0) {
        await ctx.reply(getText(ctx, 'search_no_criteria'));
        return;
      }
      const query = {};
      if (ctx.wizard.state.searchCriteria.games) {
        if (
          ctx.wizard.state.searchCriteria.gameRanks &&
          ctx.wizard.state.searchCriteria.gameRanks.length > 0
        ) {
          query['gameRanks'] = {
            $elemMatch: {
              $or: ctx.wizard.state.searchCriteria.gameRanks.map((gr) => ({
                game: gr.game,
                rank: gr.rank,
              })),
            },
          };
        } else {
          query['gameRanks.game'] = {
            $in: ctx.wizard.state.searchCriteria.games,
          };
        }
      }
      if (ctx.wizard.state.searchCriteria.gender)
        query['gender'] = ctx.wizard.state.searchCriteria.gender;
      if (ctx.wizard.state.searchCriteria.playTime)
        query['playTime'] = { $in: ctx.wizard.state.searchCriteria.playTime };
      if (ctx.wizard.state.searchCriteria.language)
        query['language'] = { $in: ctx.wizard.state.searchCriteria.language };

      try {
        let results = await User.find(query).exec();
        results = results.filter((u) => u.telegramId !== ctx.from.id);
        ctx.wizard.state.searchResults = results;
        ctx.wizard.selectStep(4);
        return await ctx.wizard.steps[4](ctx);
      } catch (err) {
        console.error('Error during search:', err);
        await ctx.reply(getText(ctx, 'error_msg'));
        return ctx.scene.leave();
      }
    }
    switch (choice) {
      case getText(ctx, 'search_game_prompt'):
        ctx.wizard.state.availableGames = [...Object.keys(gameRanks)];
        ctx.wizard.state.searchCriteria.games = [];
        ctx.wizard.state.searchCriteria.gameRanks = [];
        await ctx.reply(
          getText(ctx, 'reg_games_prompt'),
          Markup.keyboard([...ctx.wizard.state.availableGames, getText(ctx, 'done')])
            .oneTime()
            .resize()
        );
        ctx.wizard.state.currentFilter = 'games';
        return ctx.wizard.next();
      case getText(ctx, 'reg_gender_prompt'):
        ctx.wizard.state.currentFilter = 'gender';
        await ctx.reply(
          getText(ctx, 'reg_gender_prompt'),
          Markup.keyboard([
            getText(ctx, 'gender_male'),
            getText(ctx, 'gender_female'),
            getText(ctx, 'done'),
          ])
            .oneTime()
            .resize()
        );
        return ctx.wizard.next();
      case getText(ctx, 'reg_playtime_prompt'):
        ctx.wizard.state.availablePlayTimes = [
          getText(ctx, 'playtime_day'),
          getText(ctx, 'playtime_night'),
          getText(ctx, 'playtime_morning'),
          getText(ctx, 'playtime_evening'),
        ];
        ctx.wizard.state.searchCriteria.playTime = [];
        await ctx.reply(
          getText(ctx, 'reg_playtime_prompt'),
          Markup.keyboard([...ctx.wizard.state.availablePlayTimes, getText(ctx, 'done')])
            .oneTime()
            .resize()
        );
        ctx.wizard.state.currentFilter = 'playTime';
        return ctx.wizard.next();
      case getText(ctx, 'reg_language_prompt'):
        ctx.wizard.state.availableLanguages = [
          getText(ctx, 'lang_english_option'),
          getText(ctx, 'lang_russian_option'),
          getText(ctx, 'lang_ukrainian_option'),
        ];
        ctx.wizard.state.searchCriteria.language = [];
        await ctx.reply(
          getText(ctx, 'reg_language_prompt'),
          Markup.keyboard([...ctx.wizard.state.availableLanguages, getText(ctx, 'done')])
            .oneTime()
            .resize()
        );
        ctx.wizard.state.currentFilter = 'language';
        return ctx.wizard.next();
      default:
        await ctx.reply(getText(ctx, 'search_return_menu'));
        return;
    }
  },
  async (ctx) => {
    const results = ctx.wizard.state.searchResults;
    if (results.length === 0) {
      await ctx.reply(getText(ctx, 'search_results_none'), Markup.removeKeyboard());
    } else {
      for (const user of results) {
        const reviews = await Review.find({ reviewedUserId: user.telegramId });
        const averageRating = reviews.length
          ? (
              reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            ).toFixed(1)
          : getText(ctx, 'no_game_info');

        let response = `<b>👤 @${escapeHTML(user.username) || getText(ctx, 'profile_no_profile')}</b>\n`;
        response += `${getText(ctx, 'profile_main', {
          age: user.age,
          gender: user.gender,
          playTime: user.playTime.join(', '),
          language: user.language.join(', '),
        })}`;
        response += `${getText(ctx, 'search_completed', { averageRating })}`;

        await ctx.replyWithHTML(response);
      }
    }
    return ctx.scene.leave();
  }
);

module.exports = findWizard;
