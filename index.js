require('dotenv').config();
const { Telegraf, session, Scenes } = require('telegraf');
const mongoose = require('mongoose');
const { getText } = require('./utils/i18n');

const registrationWizard = require('./scenes/registration');
const findWizard = require('./scenes/find');
const reportWizard = require('./scenes/report');

const { setupCommands } = require('./handlers/commands');
const { setupCallbackQueryHandler } = require('./handlers/callbackQuery');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Успешно подключились к MongoDB'))
  .catch((error) => console.error('Ошибка подключения к MongoDB:', error));

const bot = new Telegraf(process.env.BOT_TOKEN);
const stage = new Scenes.Stage([registrationWizard, findWizard, reportWizard]);

bot.use(session());
bot.use(stage.middleware());

// Prompt for language selection if not set
bot.use(async (ctx, next) => {
  if (!ctx.session.language) {
    await ctx.reply(getText({ session: { language: 'en' } }, 'language_choice'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: getText({ session: { language: 'en' } }, 'english_button'), callback_data: 'lang_en' }],
          [{ text: getText({ session: { language: 'ru' } }, 'russian_button'), callback_data: 'lang_ru' }],
          [{ text: getText({ session: { language: 'ua' } }, 'ukrainian_button'), callback_data: 'lang_ua' }]
        ]
      }
    });
    return;
  }
  await next();
});

// Handle language selection
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (data.startsWith('lang_')) {
    const lang = data.split('_')[1];
    ctx.session.language = lang;
    await ctx.reply(getText(ctx, 'language_selected', { lang: getText(ctx, `${lang}_button`) }));
    return;
  }
});

setupCommands(bot);
setupCallbackQueryHandler(bot);

bot.launch().then(() => console.log('Бот успешно запущен'));

bot.catch((err, ctx) => {
  console.error(`Произошла ошибка при обработке обновления ${ctx.update.update_id}:`, err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
