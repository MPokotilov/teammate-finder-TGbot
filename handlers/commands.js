const User = require('../models/User');

function setupCommands(bot) {
  bot.start((ctx) => ctx.reply(
    '🔥 Здравствуй, чемпион\\! 🔥\n\n' +
    'Готов собрать команду мечты? Я здесь, чтобы помочь\\! 🚀\n\n' +
    '👉 Используй команду /register, **чтобы начать\\.**\n\n' +
    'Время играть и побеждать\\! 🎮',
    { parse_mode: 'MarkdownV2' }
  ));

  bot.command('register', (ctx) => ctx.scene.enter('registrationWizard'));
  bot.command('find', (ctx) => ctx.scene.enter('findWizard'));
  bot.command('profile', async (ctx) => {
    const user = await User.findOne({ telegramId: ctx.from.id }).exec();
    if (!user) {
      await ctx.reply('У тебя еще нет профиля. Используй /register для создания.');
    } else {
      let response = `<b>Твой профиль:</b>\n`;
      response += `<b>Возраст:</b> ${user.age}\n`;
      response += `<b>Пол:</b> ${user.gender}\n`;
      response += `<b>Игры и ранги:</b>\n`;
      if (user.gameRanks && user.gameRanks.length > 0) {
        user.gameRanks.forEach((gr) => {
          response += `• ${gr.game}: ${gr.rank || 'Не указан'}\n`;
        });
      } else {
        response += 'Нет информации об играх и рангах.\n';
      }
      response += `<b>Время игры:</b> ${user.playTime.join(', ')}\n`;
      response += `<b>Язык:</b> ${user.language.join(', ')}\n`;
      response += `<b>Часовой пояс:</b> ${user.timeZone}\n`;
      response += `<b>Программы для общения:</b> ${user.communicationTool.join(', ')}\n`;
      await ctx.replyWithHTML(response);
    }
  });

  bot.command('help', (ctx) => {
    ctx.reply(
      '/start - Начать работу с ботом\n/register - Зарегистрироваться или обновить профиль\n/find - Найти тиммейтов\n/profile - Просмотреть свой профиль\n/help - Показать список команд'
    );
  });
}

module.exports = { setupCommands };
