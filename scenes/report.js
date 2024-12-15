const { Scenes } = require('telegraf');

const ADMIN_ID = 665761170;

const reportWizard = new Scenes.WizardScene(
  'reportWizard',
  async (ctx) => {
    await ctx.reply('Опишите, пожалуйста, проблему, с которой вы столкнулись. Чем подробнее, тем лучше!');
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, опишите вашу проблему текстом.');
      return;
    }
    const problemText = ctx.message.text;
    const fromId = ctx.from.id;
    let username;
    if (ctx.from.username && ctx.from.username.trim() !== '') {
      username = `@${ctx.from.username}`;
    } else {
      username = `@id${fromId}`;
    }

    const messageToAdmin = `Новый репорт о проблеме:\n\nОт: ${username}\nTelegramId: ${fromId}\n\nПроблема:\n${problemText}`;
    // Отправляем админу
    try {
      await ctx.telegram.sendMessage(ADMIN_ID, messageToAdmin);
      await ctx.reply('Спасибо за ваш отчет! Мы постараемся решить проблему в ближайшее время.');
    } catch (e) {
      console.error('Ошибка при отправке отчета админу:', e);
      await ctx.reply('Произошла ошибка при отправке отчета. Попробуйте позже.');
    }
    return ctx.scene.leave();
  }
);

module.exports = reportWizard;
