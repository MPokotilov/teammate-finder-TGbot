const { Scenes } = require('telegraf');
const { getText } = require('../utils/i18n');

const ADMIN_ID = 665761170;

const reportWizard = new Scenes.WizardScene(
  'reportWizard',
  async (ctx) => {
    await ctx.reply(getText(ctx, 'report_prompt'));
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply(getText(ctx, 'report_error'));
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

    const messageToAdmin = getText(ctx, 'report_admin_message', {
      username,
      fromId,
      problemText,
    });

    try {
      await ctx.telegram.sendMessage(ADMIN_ID, messageToAdmin);
      await ctx.reply(getText(ctx, 'report_thanks'));
    } catch (e) {
      console.error('Ошибка при отправке отчета админу:', e);
      await ctx.reply(getText(ctx, 'error_msg'));
    }
    return ctx.scene.leave();
  }
);

module.exports = reportWizard;
