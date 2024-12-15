const User = require('../models/User');
const { getText } = require('../utils/i18n');

function setupCommands(bot) {
  bot.start(async (ctx) => {
    if (!ctx.session.language) {
      await ctx.reply(getText(ctx, 'language_choice'), {
        reply_markup: {
          inline_keyboard: [
            [
              { text: getText({ session: { language: 'en' } }, 'english_button'), callback_data: 'set_language_en' },
              { text: getText({ session: { language: 'ru' } }, 'russian_button'), callback_data: 'set_language_ru' },
              { text: getText({ session: { language: 'ua' } }, 'ukrainian_button'), callback_data: 'set_language_ua' }
            ]
          ]
        }
      });
    } else {
      await ctx.reply(getText(ctx, 'greeting'), { parse_mode: 'MarkdownV2' });
    }
  });

  bot.command('register', (ctx) => ctx.scene.enter('registrationWizard'));
  bot.command('find', (ctx) => ctx.scene.enter('findWizard'));

  bot.command('profile', async (ctx) => {
    const user = await User.findOne({ telegramId: ctx.from.id }).exec();
    if (!user) {
      await ctx.reply(getText(ctx, 'profile_no_profile'));
    } else {
      let response = getText(ctx, 'profile_main', {
        age: user.age || getText(ctx, 'username_not_specified'),
        gender: user.gender ? getText(ctx, user.gender.toLowerCase()) : getText(ctx, 'username_not_specified'),
        games: user.gameRanks && user.gameRanks.length > 0
          ? user.gameRanks.map((gr) => getText(ctx, 'game_info_line', { 
              game: gr.game || getText(ctx, 'username_not_specified'), 
              rank: gr.rank || getText(ctx, 'profile_rank_not_specified') 
            })).join('\n')
          : getText(ctx, 'no_game_info'),
        playTime: user.playTime?.join(', ') || getText(ctx, 'no_game_info'),
        language: user.language?.join(', ') || getText(ctx, 'no_game_info'),
        timeZone: user.timeZone || getText(ctx, 'no_game_info'),
        tools: user.communicationTool?.join(', ') || getText(ctx, 'no_game_info')
      });
      await ctx.replyWithHTML(response);
    }
  });

  bot.command('help', (ctx) => {
    ctx.reply(getText(ctx, 'help'));
  });

  bot.command('report', (ctx) => ctx.scene.enter('reportWizard'));

  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data.startsWith('set_language_')) {
      const selectedLanguage = data.split('_')[2];
      ctx.session.language = selectedLanguage;
      await ctx.reply(getText(ctx, 'language_selected', { lang: getText(ctx, `lang_${selectedLanguage}_option`) }));
      await ctx.reply(getText(ctx, 'greeting'), { parse_mode: 'MarkdownV2' });
      await ctx.answerCbQuery();
    }
  });
}

module.exports = { setupCommands };
