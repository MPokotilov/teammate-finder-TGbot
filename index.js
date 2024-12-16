require('dotenv').config();
const { Telegraf, session, Scenes, Markup } = require('telegraf');
const mongoose = require('mongoose');
const { getText } = require('./utils/i18n');
const registrationWizard = require('./scenes/registration');
const findWizard = require('./scenes/find');
const reportWizard = require('./scenes/report');
const { setupCallbackQueryHandler } = require('./handlers/callbackQuery');
const { setupCron } = require('./utils/cron');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(new Scenes.Stage([registrationWizard, findWizard, reportWizard]).middleware());

bot.start(async (ctx) => {
    if (!ctx.session.language) {
        ctx.session.language = 'en';
        console.log('Language: ' + ctx.session.language);
    }

  
  await ctx.reply(getText(ctx, 'greeting'));

  await ctx.reply(getText(ctx, 'language_choice'), {
    reply_markup: {
      inline_keyboard: [
        [{ text: getText({ session: { language: 'en' } }, 'english_button'), callback_data: 'language_en' }],
        [{ text: getText({ session: { language: 'en' } }, 'russian_button'), callback_data: 'language_ru' }],
        [{ text: getText({ session: { language: 'en' } }, 'ukrainian_button'), callback_data: 'language_ua' }]
      ]
    }
  });
});

bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (data.startsWith('language_')) {
    // Set the language based on user selection
    const lang = data.split('_')[1];
    ctx.session.language = lang;

    // Confirm the language selection to the user
    await ctx.reply(getText(ctx, 'language_selected', { lang: getText(ctx, `lang_${lang}_option`) }));

    // Set commands in the selected language
    setupLocalizedCommands(ctx.session.language);

    // Additional onboarding if needed
    await ctx.reply(getText(ctx, 'greeting'));
  }
});

// Function to set localized bot commands
function setupLocalizedCommands(lang = 'en') {
  bot.telegram.setMyCommands([
    { command: 'start', description: getText({ session: { language: lang } }, 'help_start') },
    { command: 'register', description: getText({ session: { language: lang } }, 'help_register') },
    { command: 'find', description: getText({ session: { language: lang } }, 'help_find') },
    { command: 'profile', description: getText({ session: { language: lang } }, 'help_profile') },
    { command: 'help', description: getText({ session: { language: lang } }, 'help_help') },
    { command: 'report', description: getText({ session: { language: lang } }, 'help_report') }
  ]);
}

setupCallbackQueryHandler(bot);
setupCron(bot);

bot.launch().then(() => console.log('Bot launched!'));

bot.catch((err, ctx) => {
  console.error(`Error during update ${ctx.update.update_id}:`, err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
