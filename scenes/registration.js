const { Scenes, Markup } = require('telegraf');
const User = require('../models/User');
const { getText } = require('../utils/i18n');
const { availableGames, gameRanks } = require('../utils/gameOptions.js');

const registrationWizard = new Scenes.WizardScene(
  'registrationWizard',
  async (ctx) => {
    await ctx.reply(getText(ctx, 'reg_start'));
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply(getText(ctx, 'reg_age_error'));
      return;
    }
    ctx.wizard.state.data = {};
    const age = parseInt(ctx.message.text);
    if (isNaN(age) || age <= 0) {
      await ctx.reply(getText(ctx, 'reg_age_error'));
      return;
    }
    ctx.wizard.state.data.age = age;
    await ctx.reply(
      getText(ctx, 'reg_gender_prompt'),
      Markup.keyboard(getText(ctx, 'gender_options')).oneTime().resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply(getText(ctx, 'reg_gender_error'));
      return;
    }
    const gender = ctx.message.text;
    if (!getText(ctx, 'gender_options').includes(gender)) {
      await ctx.reply(getText(ctx, 'reg_gender_error'), Markup.keyboard(getText(ctx, 'gender_options')).oneTime().resize());
      return;
    }
    ctx.wizard.state.data.gender = gender;
    ctx.wizard.state.data.games = [];
    ctx.wizard.state.data.ranks = [];
    ctx.wizard.state.availableGames = availableGames;
    await ctx.reply(
      getText(ctx, 'reg_games_prompt'),
      Markup.keyboard([...ctx.wizard.state.availableGames, getText(ctx, 'done')]).oneTime().resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply(getText(ctx, 'reg_games_none'));
      return;
    }
    const game = ctx.message.text;
    if (game === getText(ctx, 'done')) {
      if (ctx.wizard.state.data.games.length === 0) {
        await ctx.reply(getText(ctx, 'reg_games_none'));
        return;
      }
      ctx.wizard.state.currentGameIndex = 0;
      const currentGame = ctx.wizard.state.data.games[0];
      const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5'];
      await ctx.reply(
        getText(ctx, 'reg_rank_prompt', { game: currentGame }),
        Markup.keyboard([...ranksForGame, getText(ctx, 'skip')]).oneTime().resize()
      );
      return ctx.wizard.selectStep(4);
    }
    if (!ctx.wizard.state.availableGames.includes(game)) {
      await ctx.reply(
        getText(ctx, 'reg_games_prompt'),
        Markup.keyboard([...ctx.wizard.state.availableGames, getText(ctx, 'done')]).oneTime().resize()
      );
      return;
    }
    ctx.wizard.state.data.games.push(game);
    ctx.wizard.state.availableGames = ctx.wizard.state.availableGames.filter((g) => g !== game);
    await ctx.reply(
      getText(ctx, 'reg_games_chosen', { games: ctx.wizard.state.data.games.join(', ') }),
      Markup.keyboard([...ctx.wizard.state.availableGames, getText(ctx, 'done')]).oneTime().resize()
    );
    return;
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply(getText(ctx, 'reg_rank_error'));
      return;
    }
    const rank = ctx.message.text;
    const currentGameIndex = ctx.wizard.state.currentGameIndex || 0;
    const currentGame = ctx.wizard.state.data.games[currentGameIndex];
    const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5', getText(ctx, 'skip')];

    if (!ctx.wizard.state.data.ranks) ctx.wizard.state.data.ranks = [];

    if (rank === getText(ctx, 'skip')) {
      ctx.wizard.state.data.ranks.push(null);
    } else if (!ranksForGame.includes(rank)) {
      await ctx.reply(
        getText(ctx, 'reg_rank_prompt', { game: currentGame }),
        Markup.keyboard(ranksForGame).oneTime().resize()
      );
      return;
    } else {
      ctx.wizard.state.data.ranks.push(rank);
    }

    ctx.wizard.state.currentGameIndex += 1;
    if (ctx.wizard.state.currentGameIndex < ctx.wizard.state.data.games.length) {
      const nextGame = ctx.wizard.state.data.games[ctx.wizard.state.currentGameIndex];
      const nextRanksForGame = gameRanks[nextGame] || ['1', '2', '3', '4', '5', getText(ctx, 'skip')];
      await ctx.reply(
        getText(ctx, 'reg_rank_prompt', { game: nextGame }),
        Markup.keyboard(nextRanksForGame).oneTime().resize()
      );
      return;
    } else {
      ctx.wizard.state.data.gameRanks = ctx.wizard.state.data.games.map((g, i) => ({ game: g, rank: ctx.wizard.state.data.ranks[i] }));
      ctx.wizard.state.data.playTime = [];
      await ctx.reply(
        getText(ctx, 'reg_playtime_prompt'),
        Markup.keyboard([...getText(ctx, 'playtime_options'), getText(ctx, 'done')]).oneTime().resize()
      );
      return ctx.wizard.next();
    }
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply(getText(ctx, 'reg_playtime_none'));
      return;
    }
    const playTime = ctx.message.text;
    if (playTime === getText(ctx, 'done')) {
      if (!ctx.wizard.state.data.playTime.length) {
        await ctx.reply(getText(ctx, 'reg_playtime_none'));
        return;
      }
      await ctx.reply(
        getText(ctx, 'reg_language_prompt'),
        Markup.keyboard([...getText(ctx, 'language_options'), getText(ctx, 'done')]).oneTime().resize()
      );
      return ctx.wizard.next();
    }
    ctx.wizard.state.data.playTime.push(playTime);
    await ctx.reply(
      getText(ctx, 'reg_playtime_prompt'),
      Markup.keyboard([...getText(ctx, 'playtime_options'), getText(ctx, 'done')]).oneTime().resize()
    );
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply(getText(ctx, 'reg_language_none'));
      return;
    }
    const language = ctx.message.text;
    if (language === getText(ctx, 'done')) {
      if (!ctx.wizard.state.data.language) {
        await ctx.reply(getText(ctx, 'reg_language_none'));
        return;
      }
      await ctx.reply(getText(ctx, 'reg_saving'));
      try {
        await User.findOneAndUpdate(
          { telegramId: ctx.from.id },
          {
            telegramId: ctx.from.id,
            username: ctx.from.username || '',
            ...ctx.wizard.state.data,
          },
          { upsert: true }
        );
        await ctx.reply(getText(ctx, 'reg_save_success'), Markup.removeKeyboard());
      } catch (err) {
        console.error('Error saving profile:', err);
        await ctx.reply(getText(ctx, 'reg_save_error'));
      }
      return ctx.scene.leave();
    }
    ctx.wizard.state.data.language.push(language);
    await ctx.reply(
      getText(ctx, 'reg_language_prompt'),
      Markup.keyboard([...getText(ctx, 'language_options'), getText(ctx, 'done')]).oneTime().resize()
    );
  }
);

module.exports = registrationWizard;
