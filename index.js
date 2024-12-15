require('dotenv').config();
const { Telegraf, session, Scenes } = require('telegraf');
const mongoose = require('mongoose');

const registrationWizard = require('./scenes/registration');
const findWizard = require('./scenes/find');
const { setupCommands } = require('./handlers/commands');
const { setupCallbackQueryHandler } = require('./handlers/callbackQuery');
const { setupCron } = require('./utils/cron');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Успешно подключились к MongoDB');
  })
  .catch((error) => {
    console.error('Ошибка подключения к MongoDB:', error);
  });

const bot = new Telegraf(process.env.BOT_TOKEN);

const stage = new Scenes.Stage([registrationWizard, findWizard]);
bot.use(session());
bot.use(stage.middleware());

bot.telegram.setMyCommands([
  { command: 'start', description: 'Начать работу с ботом' },
  { command: 'register', description: 'Зарегистрироваться или обновить профиль' },
  { command: 'find', description: 'Найти тиммейтов' },
  { command: 'profile', description: 'Просмотреть свой профиль' },
  { command: 'help', description: 'Показать список команд' },
]);

setupCommands(bot);
setupCallbackQueryHandler(bot);
setupCron(bot);

bot.launch().then(() => {
  console.log('Бот успешно запущен');
});

bot.catch((err, ctx) => {
  console.error(`Произошла ошибка при обработке обновления ${ctx.update.update_id}:`, err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
