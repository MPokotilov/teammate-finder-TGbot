const { Scenes, Markup } = require('telegraf');
const User = require('../models/User');

const availableGames = ['CS2', 'Rust', 'RainbowSixSiege', 'Dota2', 'Factorio'];
const playTimeOptions = ['День', 'Ночь', 'Утро', 'Вечер'];
const languageOptions = ['Английский', 'Русский', 'Украинский'];
const communicationOptions = ['Discord', 'Skype', 'TeamSpeak', 'Telegram'];
const genderOptions = ['Мужской', 'Женский'];
const timeZoneOptions = [
  'UTC−12:00', 'UTC−11:00', 'UTC−10:00', 'UTC−9:00', 'UTC−8:00', 'UTC−7:00',
  'UTC−6:00', 'UTC−5:00', 'UTC−4:00', 'UTC−3:00', 'UTC−2:00', 'UTC−1:00',
  'UTC±0:00', 'UTC+1:00', 'UTC+2:00', 'UTC+3:00', 'UTC+4:00', 'UTC+5:00',
  'UTC+6:00', 'UTC+7:00', 'UTC+8:00', 'UTC+9:00', 'UTC+10:00', 'UTC+11:00',
  'UTC+12:00', 'UTC+13:00', 'UTC+14:00'
];
const gameRanks = {
    'CS2': [
      'Серебро-1 (Silver I)',
      'Серебро-2 (Silver II)',
      'Серебро-3 (Silver III)',
      'Серебро-4 (Silver IV)',
      'Серебро-Элита (Silver Elite)',
      'Серебро-Великий Магистр (Silver Elite Master)',
      'Золотая Звезда-1 (Gold Nova I)',
      'Золотая Звезда-2 (Gold Nova II)',
      'Золотая Звезда-3 (Gold Nova III)',
      'Золотая Звезда-Магистр (Gold Nova Master)',
      'Магистр Хранитель-1 (Master Guardian I)',
      'Магистр Хранитель-2 (Master Guardian II)',
      'Магистр Хранитель-Элита (Master Guardian Elite)',
      'Заслуженный Магистр-Хранитель (Distinguished Master Guardian)',
      'Легендарный Беркут (Legendary Eagle)',
      'Легендарный Беркут-Магистр (Legendary Eagle Master)',
      'Великий Магистр-Высшего Ранга (Supreme Master First Class)',
      'Всемирная Элита (Global Elite)'
    ],
    'RainbowSixSiege': [
      'Copper (0 - 1,599 MMR)',
      'Bronze (1,600 - 2,099 MMR)',
      'Silver (2,100 - 2,599 MMR)',
      'Gold (2,600 - 3,100 MMR)',
      'Platinum (3,200 - 4,099 MMR)',
      'Diamond (4,100 - 4,999 MMR)',
      'Champions (5,000+ MMR)'
    ],
    'Dota2': [
      'Herald (Рекрут)',
      'Guardian (Страж)',
      'Crusader (Рыцарь)',
      'Archon (Герой)',
      'Legend (Легенда)',
      'Ancient (Властелин)',
      'Divine (Божество)',
      'Immortal (Титан)'
    ]
    // Для остальных игр ранги по умолчанию от 1 до 5
  };

const registrationWizard = new Scenes.WizardScene(
  'registrationWizard',
  async (ctx) => {
    await ctx.reply('Привет! Давай создадим твой профиль. Сколько тебе лет?');
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, введите ваш возраст числом.');
      return;
    }
    ctx.wizard.state.data = {};
    const age = parseInt(ctx.message.text);
    if (isNaN(age) || age <= 0) {
      await ctx.reply('Пожалуйста, введите корректный возраст.');
      return;
    }
    ctx.wizard.state.data.age = age;
    await ctx.reply(
      'Укажи свой пол:',
      Markup.keyboard(genderOptions).oneTime().resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите пол из списка.');
      return;
    }
    const gender = ctx.message.text;
    if (!genderOptions.includes(gender)) {
      await ctx.reply('Пожалуйста, выбери пол из списка.', Markup.keyboard(genderOptions).oneTime().resize());
      return;
    }
    ctx.wizard.state.data.gender = gender;
    ctx.wizard.state.data.games = [];
    ctx.wizard.state.data.ranks = [];
    ctx.wizard.state.availableGames = [...availableGames];
    await ctx.reply(
      'Выбери игру из списка:',
      Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово']).oneTime().resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите игру или "Готово".');
      return;
    }
    const game = ctx.message.text;
    if (game === 'Готово') {
      if (ctx.wizard.state.data.games.length === 0) {
        await ctx.reply('Вы не выбрали ни одной игры. Пожалуйста, выберите хотя бы одну игру.');
        return;
      }
      ctx.wizard.state.currentGameIndex = 0;
      const currentGame = ctx.wizard.state.data.games[0];
      const ranksForGame = gameRanks[currentGame] || ['1','2','3','4','5'];
      await ctx.reply(
        `Какой ранг в ${currentGame}?`,
        Markup.keyboard([...ranksForGame, 'Пропустить']).oneTime().resize()
      );
      return ctx.wizard.selectStep(4);
    }
    if (!ctx.wizard.state.availableGames.includes(game)) {
      await ctx.reply(
        'Пожалуйста, выберите игру из списка или "Готово".',
        Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово']).oneTime().resize()
      );
      return;
    }
    if (!ctx.wizard.state.data.games) ctx.wizard.state.data.games = [];
    if (!ctx.wizard.state.data.games.includes(game)) {
      ctx.wizard.state.data.games.push(game);
      ctx.wizard.state.availableGames = ctx.wizard.state.availableGames.filter(g => g !== game);
    }
    if (ctx.wizard.state.availableGames.length === 0) {
      await ctx.reply('Вы выбрали все доступные игры.');
      ctx.wizard.state.currentGameIndex = 0;
      const currentGame = ctx.wizard.state.data.games[0];
      const ranksForGame = gameRanks[currentGame] || ['1','2','3','4','5'];
      await ctx.reply(
        `Какой ранг в ${currentGame}?`,
        Markup.keyboard([...ranksForGame, 'Пропустить']).oneTime().resize()
      );
      return ctx.wizard.selectStep(4);
    } else {
      await ctx.reply(
        `Вы выбрали: ${ctx.wizard.state.data.games.join(', ')}.\nВыберите еще игру или "Готово".`,
        Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово']).oneTime().resize()
      );
      return;
    }
  },
  async (ctx) => {
    // Выбор рангов для каждой игры
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите ранг или "Пропустить".');
      return;
    }
    const rank = ctx.message.text.trim();
    const currentGameIndex = ctx.wizard.state.currentGameIndex || 0;
    const currentGame = ctx.wizard.state.data.games[currentGameIndex];
    const ranksForGame = gameRanks[currentGame] || ['1','2','3','4','5','Пропустить'];

    if (!ctx.wizard.state.data.ranks) ctx.wizard.state.data.ranks = [];

    if (rank === 'Пропустить') {
      ctx.wizard.state.data.ranks.push(null);
    } else if (!ranksForGame.includes(rank)) {
      await ctx.reply(
        `Пожалуйста, выберите ранг для ${currentGame} или "Пропустить".`,
        Markup.keyboard(ranksForGame).oneTime().resize()
      );
      return;
    } else {
      ctx.wizard.state.data.ranks.push(rank);
    }

    ctx.wizard.state.currentGameIndex += 1;
    if (ctx.wizard.state.currentGameIndex < ctx.wizard.state.data.games.length) {
      const nextGame = ctx.wizard.state.data.games[ctx.wizard.state.currentGameIndex];
      const nextRanksForGame = gameRanks[nextGame] || ['1','2','3','4','5','Пропустить'];
      await ctx.reply(
        `Какой ранг в ${nextGame}?`,
        Markup.keyboard([...nextRanksForGame,'Пропустить']).oneTime().resize()
      );
      return; 
    } else {
      ctx.wizard.state.data.gameRanks = ctx.wizard.state.data.games.map((g, i) => ({ game: g, rank: ctx.wizard.state.data.ranks[i] }));
      ctx.wizard.state.data.playTime = [];
      ctx.wizard.state.availablePlayTimes = [...playTimeOptions];
      await ctx.reply(
        'Выберите время игры (можно выбрать несколько вариантов):',
        Markup.keyboard([...ctx.wizard.state.availablePlayTimes, 'Готово']).oneTime().resize()
      );
      return ctx.wizard.next();
    }
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите время или "Готово".');
      return;
    }
    const playTime = ctx.message.text;
    if (playTime === 'Готово') {
      if (!ctx.wizard.state.data.playTime || ctx.wizard.state.data.playTime.length === 0) {
        await ctx.reply('Вы не выбрали ни одного времени игры. Пожалуйста, выберите хотя бы один вариант.');
        return;
      }
      ctx.wizard.state.data.language = [];
      ctx.wizard.state.availableLanguages = [...languageOptions];
      await ctx.reply(
        'Выберите предпочитаемый язык (можно несколько):',
        Markup.keyboard([...ctx.wizard.state.availableLanguages, 'Готово']).oneTime().resize()
      );
      return ctx.wizard.next();
    }
    if (!ctx.wizard.state.availablePlayTimes.includes(playTime)) {
      await ctx.reply(
        'Пожалуйста, выберите время из списка или "Готово".',
        Markup.keyboard([...ctx.wizard.state.availablePlayTimes, 'Готово']).oneTime().resize()
      );
      return;
    }
    if (!ctx.wizard.state.data.playTime) ctx.wizard.state.data.playTime = [];
    ctx.wizard.state.data.playTime.push(playTime);
    ctx.wizard.state.availablePlayTimes = ctx.wizard.state.availablePlayTimes.filter(pt => pt !== playTime);
    await ctx.reply(
      `Вы выбрали: ${ctx.wizard.state.data.playTime.join(', ')}.\nВыберите еще или "Готово".`,
      Markup.keyboard([...ctx.wizard.state.availablePlayTimes, 'Готово']).oneTime().resize()
    );
    return;
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите язык или "Готово".');
      return;
    }
    const language = ctx.message.text;
    if (language === 'Готово') {
      if (!ctx.wizard.state.data.language || ctx.wizard.state.data.language.length === 0) {
        await ctx.reply('Вы не выбрали ни одного языка. Пожалуйста, выберите хотя бы один вариант.');
        return;
      }
      ctx.wizard.state.data.communicationTool = [];
      ctx.wizard.state.availableCommunicationTools = [...communicationOptions];
      await ctx.reply(
        'Выберите программы для общения (можно несколько):',
        Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
      );
      return ctx.wizard.next();
    }
    if (!ctx.wizard.state.availableLanguages.includes(language)) {
      await ctx.reply(
        'Пожалуйста, выберите язык из списка или "Готово".',
        Markup.keyboard([...ctx.wizard.state.availableLanguages, 'Готово']).oneTime().resize()
      );
      return;
    }
    if (!ctx.wizard.state.data.language) ctx.wizard.state.data.language = [];
    ctx.wizard.state.data.language.push(language);
    ctx.wizard.state.availableLanguages = ctx.wizard.state.availableLanguages.filter(lang => lang !== language);
    await ctx.reply(
      `Вы выбрали: ${ctx.wizard.state.data.language.join(', ')}.\nВыберите еще или "Готово".`,
      Markup.keyboard([...ctx.wizard.state.availableLanguages, 'Готово']).oneTime().resize()
    );
    return;
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите программу или "Готово".');
      return;
    }
    const tool = ctx.message.text;
    if (tool === 'Готово') {
      if (!ctx.wizard.state.data.communicationTool || ctx.wizard.state.data.communicationTool.length === 0) {
        await ctx.reply('Вы не выбрали ни одной программы. Пожалуйста, выберите хотя бы один вариант.');
        return;
      }
      await ctx.reply(
        'Выберите свой часовой пояс:',
        Markup.keyboard(timeZoneOptions).oneTime().resize()
      );
      return ctx.wizard.next();
    }
    if (!ctx.wizard.state.availableCommunicationTools.includes(tool)) {
      await ctx.reply(
        'Пожалуйста, выберите программу из списка или "Готово".',
        Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
      );
      return;
    }
    if (!ctx.wizard.state.data.communicationTool) ctx.wizard.state.data.communicationTool = [];
    ctx.wizard.state.data.communicationTool.push(tool);
    ctx.wizard.state.availableCommunicationTools = ctx.wizard.state.availableCommunicationTools.filter(t => t !== tool);
    await ctx.reply(
      `Вы выбрали: ${ctx.wizard.state.data.communicationTool.join(', ')}.\nВыберите еще или "Готово".`,
      Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
    );
    return;
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите часовой пояс из списка.');
      return;
    }
    const timeZone = ctx.message.text;
    if (!timeZoneOptions.includes(timeZone)) {
      await ctx.reply('Пожалуйста, выберите часовой пояс из списка.', Markup.keyboard(timeZoneOptions).oneTime().resize());
      return;
    }
    ctx.wizard.state.data.timeZone = timeZone;
    const userData = ctx.wizard.state.data;
    try {
      await User.findOneAndUpdate(
        { telegramId: ctx.from.id },
        {
          telegramId: ctx.from.id,
          username: ctx.from.username || '',
          ...userData,
        },
        { upsert: true }
      );
      await ctx.reply('Твой профиль успешно сохранен!', Markup.removeKeyboard());
    } catch (err) {
      console.error('Ошибка при сохранении профиля:', err);
      await ctx.reply('Произошла ошибка при сохранении профиля. Пожалуйста, попробуй позже.');
    }
    return ctx.scene.leave();
  }
);

module.exports = registrationWizard;
