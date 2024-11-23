require('dotenv').config();
const { Telegraf, Scenes, session, Markup } = require('telegraf');
const mongoose = require('mongoose');
const User = require('./models/User');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Успешно подключились к MongoDB');
  })
  .catch((error) => {
    console.error('Ошибка подключения к MongoDB:', error);
  });

// Списки доступных опций
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

// Создаем сцену регистрации
const registrationWizard = new Scenes.WizardScene(
  'registrationWizard',
  async (ctx) => {
    await ctx.reply('Привет! Давай создадим твой профиль. Сколько тебе лет?');
    return ctx.wizard.next();
  },
  async (ctx) => {
    // Проверяем наличие ctx.message и ctx.message.text
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
    // Добавляем выбор пола
    await ctx.reply(
      'Укажи свой пол:',
      Markup.keyboard(genderOptions).oneTime().resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    // Проверяем наличие ctx.message и ctx.message.text
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
    // Инициализируем массивы для игр и рангов
    ctx.wizard.state.data.games = [];
    ctx.wizard.state.data.ranks = [];
    ctx.wizard.state.availableGames = [...availableGames]; // Копируем список доступных игр
    // Начинаем выбор игр
    await ctx.reply(
      'Выбери игру из списка:',
      Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово'])
        .oneTime()
        .resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    // Проверяем наличие ctx.message и ctx.message.text
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите игру из списка или нажмите "Готово".');
      return;
    }
    const game = ctx.message.text;
    if (game === 'Готово') {
      if (ctx.wizard.state.data.games.length === 0) {
        await ctx.reply('Вы не выбрали ни одной игры. Пожалуйста, выберите хотя бы одну игру.');
        return; // Остаемся на том же шаге
      }
      // Переходим к следующему шагу
      ctx.wizard.state.currentGameIndex = 0; // Индекс текущей игры для запроса ранга
      // Переходим к запросу рангов
      const currentGame = ctx.wizard.state.data.games[ctx.wizard.state.currentGameIndex];
      const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5'];
      await ctx.reply(
        `Какой ранг в ${currentGame}?`,
        Markup.keyboard(ranksForGame).oneTime().resize()
      );
      return ctx.wizard.selectStep(4); // Переходим к шагу запроса рангов
    }
    if (!ctx.wizard.state.availableGames.includes(game)) {
      await ctx.reply(
        'Пожалуйста, выберите игру из списка или нажмите "Готово" для завершения выбора.',
        Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово']).oneTime().resize()
      );
      return; // Остаемся на том же шаге
    }
    // Добавляем игру в список и удаляем из доступных игр
    if (!ctx.wizard.state.data.games.includes(game)) {
      ctx.wizard.state.data.games.push(game);
      ctx.wizard.state.availableGames = ctx.wizard.state.availableGames.filter(g => g !== game);
    }
    // Если нет больше доступных игр, автоматически переходим к следующему шагу
    if (ctx.wizard.state.availableGames.length === 0) {
      await ctx.reply('Вы выбрали все доступные игры.');
      ctx.wizard.state.currentGameIndex = 0;
      const currentGame = ctx.wizard.state.data.games[ctx.wizard.state.currentGameIndex];
      const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5'];
      await ctx.reply(
        `Какой ранг в ${currentGame}?`,
        Markup.keyboard(ranksForGame).oneTime().resize()
      );
      return ctx.wizard.selectStep(4); // Переходим к шагу запроса рангов
    } else {
      await ctx.reply(
        `Вы выбрали: ${ctx.wizard.state.data.games.join(', ')}.\nВыберите еще игру или нажмите "Готово" для завершения.`,
        Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово']).oneTime().resize()
      );
      return; // Остаемся на этом шаге
    }
  },
  async (ctx) => {
    // Проверяем наличие ctx.message и ctx.message.text
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите ранг из списка.');
      return;
    }
    const currentGame = ctx.wizard.state.data.games[ctx.wizard.state.currentGameIndex];
    const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5'];
    const rank = ctx.message.text.trim();
    if (!ranksForGame.includes(rank)) {
      await ctx.reply(
        `Пожалуйста, выберите ранг для ${currentGame} из списка.`,
        Markup.keyboard(ranksForGame).oneTime().resize()
      );
      return; // Остаемся на том же шаге
    }
    ctx.wizard.state.data.ranks.push(rank);
    ctx.wizard.state.currentGameIndex += 1;
    if (ctx.wizard.state.currentGameIndex < ctx.wizard.state.data.games.length) {
      // Запрашиваем ранг для следующей игры
      const nextGame = ctx.wizard.state.data.games[ctx.wizard.state.currentGameIndex];
      const nextRanksForGame = gameRanks[nextGame] || ['1', '2', '3', '4', '5'];
      await ctx.reply(
        `Какой ранг в ${nextGame}?`,
        Markup.keyboard(nextRanksForGame).oneTime().resize()
      );
      return; // Остаемся на этом же шаге
    } else {
      // Все ранги собраны, переходим к выбору времени игры
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
    // Шаг выбора времени игры
    // Проверяем наличие ctx.message и ctx.message.text
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите время игры из списка или нажмите "Готово".');
      return;
    }
    const playTime = ctx.message.text;
    if (playTime === 'Готово') {
      if (ctx.wizard.state.data.playTime.length === 0) {
        await ctx.reply('Вы не выбрали ни одного времени игры. Пожалуйста, выберите хотя бы один вариант.');
        return; // Остаемся на том же шаге
      }
      // Переходим к выбору языка
      ctx.wizard.state.data.language = [];
      ctx.wizard.state.availableLanguages = [...languageOptions];
      await ctx.reply(
        'Выберите предпочитаемый язык общения (можно выбрать несколько вариантов):',
        Markup.keyboard([...ctx.wizard.state.availableLanguages, 'Готово']).oneTime().resize()
      );
      return ctx.wizard.next();
    }
    if (!ctx.wizard.state.availablePlayTimes.includes(playTime)) {
      await ctx.reply(
        'Пожалуйста, выберите время игры из списка или нажмите "Готово" для завершения выбора.',
        Markup.keyboard([...ctx.wizard.state.availablePlayTimes, 'Готово']).oneTime().resize()
      );
      return; // Остаемся на том же шаге
    }
    // Добавляем время игры в список и удаляем из доступных
    if (!ctx.wizard.state.data.playTime.includes(playTime)) {
      ctx.wizard.state.data.playTime.push(playTime);
      ctx.wizard.state.availablePlayTimes = ctx.wizard.state.availablePlayTimes.filter(pt => pt !== playTime);
    }
    await ctx.reply(
      `Вы выбрали: ${ctx.wizard.state.data.playTime.join(', ')}.\nВыберите еще или нажмите "Готово" для завершения.`,
      Markup.keyboard([...ctx.wizard.state.availablePlayTimes, 'Готово']).oneTime().resize()
    );
    return; // Остаемся на этом шаге
  },
  async (ctx) => {
    // Шаг выбора языка
    // Проверяем наличие ctx.message и ctx.message.text
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите язык из списка или нажмите "Готово".');
      return;
    }
    const language = ctx.message.text;
    if (language === 'Готово') {
      if (ctx.wizard.state.data.language.length === 0) {
        await ctx.reply('Вы не выбрали ни одного языка. Пожалуйста, выберите хотя бы один вариант.');
        return; // Остаемся на том же шаге
      }
      // Переходим к выбору программ для общения
      ctx.wizard.state.data.communicationTool = [];
      ctx.wizard.state.availableCommunicationTools = [...communicationOptions];
      await ctx.reply(
        'Выберите программы для общения (можно выбрать несколько вариантов):',
        Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
      );
      return ctx.wizard.next();
    }
    if (!ctx.wizard.state.availableLanguages.includes(language)) {
      await ctx.reply(
        'Пожалуйста, выберите язык из списка или нажмите "Готово" для завершения выбора.',
        Markup.keyboard([...ctx.wizard.state.availableLanguages, 'Готово']).oneTime().resize()
      );
      return; // Остаемся на том же шаге
    }
    // Добавляем язык в список и удаляем из доступных
    if (!ctx.wizard.state.data.language.includes(language)) {
      ctx.wizard.state.data.language.push(language);
      ctx.wizard.state.availableLanguages = ctx.wizard.state.availableLanguages.filter(lang => lang !== language);
    }
    await ctx.reply(
      `Вы выбрали: ${ctx.wizard.state.data.language.join(', ')}.\nВыберите еще или нажмите "Готово" для завершения.`,
      Markup.keyboard([...ctx.wizard.state.availableLanguages, 'Готово']).oneTime().resize()
    );
    return; // Остаемся на этом шаге
  },
  async (ctx) => {
    // Шаг выбора программ для общения
    // Проверяем наличие ctx.message и ctx.message.text
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите программу из списка или нажмите "Готово".');
      return;
    }
    const tool = ctx.message.text;
    if (tool === 'Готово') {
      if (ctx.wizard.state.data.communicationTool.length === 0) {
        await ctx.reply('Вы не выбрали ни одной программы. Пожалуйста, выберите хотя бы один вариант.');
        return; // Остаемся на том же шаге
      }
      // Переходим к выбору часового пояса
      await ctx.reply(
        'Выберите свой часовой пояс:',
        Markup.keyboard(timeZoneOptions).oneTime().resize()
      );
      return ctx.wizard.next();
    }
    if (!ctx.wizard.state.availableCommunicationTools.includes(tool)) {
      await ctx.reply(
        'Пожалуйста, выберите программу из списка или нажмите "Готово" для завершения выбора.',
        Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
      );
      return; // Остаемся на том же шаге
    }
    // Добавляем программу в список и удаляем из доступных
    if (!ctx.wizard.state.data.communicationTool.includes(tool)) {
      ctx.wizard.state.data.communicationTool.push(tool);
      ctx.wizard.state.availableCommunicationTools = ctx.wizard.state.availableCommunicationTools.filter(t => t !== tool);
    }
    await ctx.reply(
      `Вы выбрали: ${ctx.wizard.state.data.communicationTool.join(', ')}.\nВыберите еще или нажмите "Готово" для завершения.`,
      Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
    );
    return; // Остаемся на этом шаге
  },
  async (ctx) => {
    // Шаг выбора часового пояса
    // Проверяем наличие ctx.message и ctx.message.text
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
    // Сохранение данных в базе данных
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
      console.log('Данные успешно сохранены в базу данных');
    } catch (err) {
      console.error('Ошибка при сохранении профиля:', err);
      await ctx.reply('Произошла ошибка при сохранении профиля. Пожалуйста, попробуй позже.');
    }
    return ctx.scene.leave();
  }
);

// Создаем сцену поиска
const findWizard = new Scenes.WizardScene(
  'findWizard',
  async (ctx) => {
    ctx.wizard.state.searchCriteria = {};
    ctx.wizard.state.selectedGames = [];
    ctx.wizard.state.selectedRanks = [];
    await ctx.reply(
      'Выберите критерии поиска (можно выбрать несколько):',
      Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа для связи', 'Готово']).oneTime().resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    // Проверяем наличие ctx.message и ctx.message.text
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите критерий из списка или нажмите "Готово".');
      return;
    }
    const choice = ctx.message.text;
    if (choice === 'Готово') {
      if (Object.keys(ctx.wizard.state.searchCriteria).length === 0) {
        await ctx.reply('Вы не выбрали ни одного критерия. Пожалуйста, выберите хотя бы один.');
        return; // Остаемся на том же шаге
      }
      // Выполняем поиск
      const query = {};
      if (ctx.wizard.state.searchCriteria.games) {
        query['games'] = { $in: ctx.wizard.state.searchCriteria.games };
      }
      if (ctx.wizard.state.searchCriteria.ranks) {
        query['ranks'] = { $in: ctx.wizard.state.searchCriteria.ranks };
      }
      if (ctx.wizard.state.searchCriteria.gender) {
        query['gender'] = ctx.wizard.state.searchCriteria.gender;
      }
      if (ctx.wizard.state.searchCriteria.playTime) {
        query['playTime'] = { $in: ctx.wizard.state.searchCriteria.playTime };
      }
      if (ctx.wizard.state.searchCriteria.language) {
        query['language'] = { $in: ctx.wizard.state.searchCriteria.language };
      }
      if (ctx.wizard.state.searchCriteria.timeZone) {
        query['timeZone'] = { $in: ctx.wizard.state.searchCriteria.timeZone };
      }
      if (ctx.wizard.state.searchCriteria.communicationTool) {
        query['communicationTool'] = { $in: ctx.wizard.state.searchCriteria.communicationTool };
      }
      const results = await User.find(query).exec();
      if (results.length === 0) {
        await ctx.reply('Не найдено пользователей по вашему запросу.');
      } else {
        let response = 'Найдены следующие пользователи:\n';
        results.forEach((user) => {
          response += `\n👤 @${user.username || 'не указан'}\nВозраст: ${user.age}\nПол: ${user.gender}\nИгры: ${user.games.join(', ')}\nРанги: ${user.ranks.join(', ')}\nВремя игры: ${user.playTime.join(', ')}\nЯзык: ${user.language.join(', ')}\nЧасовой пояс: ${user.timeZone}\nПрограммы для общения: ${user.communicationTool.join(', ')}\n`;
        });
        await ctx.reply(response);
      }
      return ctx.scene.leave();
    }
    switch (choice) {
      case 'Игра':
        ctx.wizard.state.availableGames = [...availableGames];
        ctx.wizard.state.searchCriteria.games = [];
        await ctx.reply(
          'Выберите игру (можно выбрать несколько):',
          Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'games';
        return ctx.wizard.next();
      case 'Ранг':
        if (!ctx.wizard.state.searchCriteria.games || ctx.wizard.state.searchCriteria.games.length === 0) {
          await ctx.reply('Сначала выберите игры, для которых хотите указать ранги.', Markup.keyboard(['Игра', 'Готово']).oneTime().resize());
          return; // Остаемся на том же шаге
        }
        ctx.wizard.state.currentGameIndex = 0;
        ctx.wizard.state.searchCriteria.ranks = [];
        await askForRank(ctx);
        return ctx.wizard.selectStep(3); // Переходим к шагу выбора рангов
      case 'Пол':
        ctx.wizard.state.currentFilter = 'gender';
        await ctx.reply(
          'Выберите пол:',
          Markup.keyboard(genderOptions).oneTime().resize()
        );
        return ctx.wizard.next();
      case 'Время игры':
        ctx.wizard.state.availablePlayTimes = [...playTimeOptions];
        ctx.wizard.state.searchCriteria.playTime = [];
        await ctx.reply(
          'Выберите время игры (можно выбрать несколько):',
          Markup.keyboard([...ctx.wizard.state.availablePlayTimes, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'playTime';
        return ctx.wizard.next();
      case 'Язык':
        ctx.wizard.state.availableLanguages = [...languageOptions];
        ctx.wizard.state.searchCriteria.language = [];
        await ctx.reply(
          'Выберите язык (можно выбрать несколько):',
          Markup.keyboard([...ctx.wizard.state.availableLanguages, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'language';
        return ctx.wizard.next();
      case 'Часовой пояс':
        ctx.wizard.state.availableTimeZones = [...timeZoneOptions];
        ctx.wizard.state.searchCriteria.timeZone = [];
        await ctx.reply(
          'Выберите часовой пояс (можно выбрать несколько):',
          Markup.keyboard([...ctx.wizard.state.availableTimeZones, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'timeZone';
        return ctx.wizard.next();
      case 'Программа для связи':
        ctx.wizard.state.availableCommunicationTools = [...communicationOptions];
        ctx.wizard.state.searchCriteria.communicationTool = [];
        await ctx.reply(
          'Выберите программы для общения (можно выбрать несколько):',
          Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'communicationTool';
        return ctx.wizard.next();
      default:
        await ctx.reply('Пожалуйста, выберите критерий из списка или нажмите "Готово".', Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа для связи', 'Готово']).oneTime().resize());
        return; // Остаемся на том же шаге
    }
  },
  async (ctx) => {
    // Обработка выбора значений для критериев (кроме рангов)
    // Проверяем наличие ctx.message и ctx.message.text
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите из списка или нажмите "Готово".');
      return;
    }
    const currentFilter = ctx.wizard.state.currentFilter;
    const value = ctx.message.text;
    if (value === 'Готово') {
      // Возвращаемся к выбору критериев
      await ctx.reply(
        'Выберите дополнительные критерии или нажмите "Готово" для начала поиска.',
        Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа для связи', 'Готово']).oneTime().resize()
      );
      return ctx.wizard.selectStep(1);
    }
    let availableOptions;
    switch (currentFilter) {
      case 'games':
        availableOptions = ctx.wizard.state.availableGames;
        break;
      case 'playTime':
        availableOptions = ctx.wizard.state.availablePlayTimes;
        break;
      case 'language':
        availableOptions = ctx.wizard.state.availableLanguages;
        break;
      case 'communicationTool':
        availableOptions = ctx.wizard.state.availableCommunicationTools;
        break;
      case 'timeZone':
        availableOptions = ctx.wizard.state.availableTimeZones;
        break;
      case 'gender':
        availableOptions = genderOptions;
        break;
      default:
        await ctx.reply('Произошла ошибка. Пожалуйста, начните поиск заново.', Markup.removeKeyboard());
        return ctx.scene.leave();
    }
    if (!availableOptions.includes(value)) {
      await ctx.reply(
        `Пожалуйста, выберите из списка или нажмите "Готово".`,
        Markup.keyboard([...availableOptions, 'Готово']).oneTime().resize()
      );
      return; // Остаемся на том же шаге
    }
    // Добавляем выбранное значение в критерии поиска
    if (currentFilter === 'gender') {
      ctx.wizard.state.searchCriteria[currentFilter] = value;
    } else {
      if (!ctx.wizard.state.searchCriteria[currentFilter].includes(value)) {
        ctx.wizard.state.searchCriteria[currentFilter].push(value);
        if (currentFilter !== 'gender') {
          availableOptions.splice(availableOptions.indexOf(value), 1);
        }
      }
    }
    await ctx.reply(
      `Вы выбрали: ${Array.isArray(ctx.wizard.state.searchCriteria[currentFilter]) ? ctx.wizard.state.searchCriteria[currentFilter].join(', ') : ctx.wizard.state.searchCriteria[currentFilter]}.\nВыберите еще или нажмите "Готово" для завершения.`,
      Markup.keyboard([...availableOptions, 'Готово']).oneTime().resize()
    );
    return; // Остаемся на этом шаге
  },
  async (ctx) => {
    // Шаг выбора рангов для выбранных игр
    // Проверяем наличие ctx.message и ctx.message.text
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите ранг из списка.');
      return;
    }
    const currentGameIndex = ctx.wizard.state.currentGameIndex;
    const selectedGames = ctx.wizard.state.searchCriteria.games;
    const currentGame = selectedGames[currentGameIndex];
    const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5'];
    const rank = ctx.message.text.trim();
    if (rank === 'Готово') {
      // Если пользователь нажал "Готово" до выбора рангов для всех игр
      if (ctx.wizard.state.searchCriteria.ranks.length < selectedGames.length) {
        await ctx.reply('Вы не выбрали ранги для всех выбранных игр. Пожалуйста, завершите выбор.', Markup.keyboard(ranksForGame).oneTime().resize());
        return; // Остаемся на том же шаге
      } else {
        // Возвращаемся к выбору критериев
        await ctx.reply(
          'Выберите дополнительные критерии или нажмите "Готово" для начала поиска.',
          Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа для связи', 'Готово']).oneTime().resize()
        );
        return ctx.wizard.selectStep(1);
      }
    }
    if (!ranksForGame.includes(rank)) {
      await ctx.reply(
        `Пожалуйста, выберите ранг для ${currentGame} из списка.`,
        Markup.keyboard([...ranksForGame, 'Готово']).oneTime().resize()
      );
      return; // Остаемся на том же шаге
    }
    ctx.wizard.state.searchCriteria.ranks.push(rank);
    ctx.wizard.state.currentGameIndex += 1;
    if (ctx.wizard.state.currentGameIndex < selectedGames.length) {
      // Запрашиваем ранг для следующей игры
      const nextGame = selectedGames[ctx.wizard.state.currentGameIndex];
      const nextRanksForGame = gameRanks[nextGame] || ['1', '2', '3', '4', '5'];
      await ctx.reply(
        `Какой ранг в ${nextGame}?`,
        Markup.keyboard([...nextRanksForGame, 'Готово']).oneTime().resize()
      );
      return; // Остаемся на этом шаге
    } else {
      // Все ранги собраны, возвращаемся к выбору критериев
      await ctx.reply(
        'Выберите дополнительные критерии или нажмите "Готово" для начала поиска.',
        Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа для связи', 'Готово']).oneTime().resize()
      );
      return ctx.wizard.selectStep(1);
    }
  }
);

// Функция для запроса ранга
async function askForRank(ctx) {
  const currentGameIndex = ctx.wizard.state.currentGameIndex;
  const selectedGames = ctx.wizard.state.searchCriteria.games;
  const currentGame = selectedGames[currentGameIndex];
  const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5'];
  await ctx.reply(
    `Выберите ранг для ${currentGame}:`,
    Markup.keyboard([...ranksForGame, 'Готово']).oneTime().resize()
  );
}

// Регистрация сцен
const stage = new Scenes.Stage([registrationWizard, findWizard]);
bot.use(session());
bot.use(stage.middleware());

// Установка команд бота для меню
bot.telegram.setMyCommands([
  { command: 'start', description: 'Начать работу с ботом' },
  { command: 'register', description: 'Зарегистрироваться или обновить профиль' },
  { command: 'find', description: 'Найти тиммейтов' },
  { command: 'profile', description: 'Просмотреть свой профиль' },
  { command: 'help', description: 'Показать список команд' },
]);

// Промежуточное ПО для обработки только текстовых сообщений
bot.use((ctx, next) => {
  if (ctx.message && ctx.message.text) {
    return next();
  } else {
    // Игнорируем обновления, не содержащие текстовых сообщений
    return;
  }
});

// Обработчики команд
bot.start((ctx) => ctx.reply(
    '🔥 *Здравствуй, чемпион\\!* 🔥\n\n' +
    'Готов собрать команду мечты? _Я здесь, чтобы помочь\\!_ 🚀\n\n' +
    '👉 *Используй команду* `/help`, *чтобы узнать, что я могу\\.*\n\n' +
    '*Время играть и побеждать\\!* 🎮',
    { parse_mode: 'MarkdownV2' }
));

bot.command('register', (ctx) => ctx.scene.enter('registrationWizard'));
bot.command('find', (ctx) => ctx.scene.enter('findWizard'));
bot.command('profile', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id }).exec();
  if (!user) {
    await ctx.reply('У тебя еще нет профиля. Используй /register для создания.');
  } else {
    await ctx.reply(
      `Твой профиль:\nВозраст: ${user.age}\nПол: ${user.gender}\nИгры: ${user.games.join(', ')}\nРанги: ${user.ranks.join(', ')}\nВремя игры: ${user.playTime.join(', ')}\nЯзык: ${user.language.join(', ')}\nЧасовой пояс: ${user.timeZone}\nПрограммы для общения: ${user.communicationTool.join(', ')}`
    );
  }
});
bot.command('help', (ctx) => {
  ctx.reply(
    '/start - Начать работу с ботом\n/register - Зарегистрироваться или обновить профиль\n/find - Найти тиммейтов\n/profile - Просмотреть свой профиль\n/help - Показать список команд'
  );
});

// Запуск бота
bot.launch().then(() => {
  console.log('Бот успешно запущен');
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error(`Произошла ошибка при обработке обновления ${ctx.update.update_id}:`, err);
});
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
