require('dotenv').config();
const { Telegraf, Scenes, session, Markup } = require('telegraf');
const mongoose = require('mongoose');
const User = require('./models/User');
const Review = require('./models/Review'); // Убедитесь, что эта модель создана

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

// Функция для экранирования HTML
function escapeHTML(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/[&<>"]/g, function(tag) {
    const charsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    };
    return charsToReplace[tag] || tag;
  });
}

// Создаем сцену регистрации
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
    ctx.wizard.state.selectedGames = [];
    ctx.wizard.state.selectedRanks = [];
    ctx.wizard.state.availableGames = [...availableGames];
    await ctx.reply(
      'Выбери игру из списка:',
      Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово'])
        .oneTime()
        .resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите игру из списка или нажмите "Готово".');
      return;
    }
    const game = ctx.message.text;
    if (game === 'Готово') {
      if (ctx.wizard.state.selectedGames.length === 0) {
        await ctx.reply('Вы не выбрали ни одной игры. Пожалуйста, выберите хотя бы одну игру.');
        return;
      }
      ctx.wizard.state.currentGameIndex = 0;
      const currentGame = ctx.wizard.state.selectedGames[ctx.wizard.state.currentGameIndex];
      const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5'];
      await ctx.reply(
        `Какой ранг в ${currentGame}?`,
        Markup.keyboard([...ranksForGame, 'Пропустить']).oneTime().resize()
      );
      return ctx.wizard.next();
    }
    if (!ctx.wizard.state.availableGames.includes(game)) {
      await ctx.reply(
        'Пожалуйста, выберите игру из списка или нажмите "Готово" для завершения выбора.',
        Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово']).oneTime().resize()
      );
      return;
    }
    if (!ctx.wizard.state.selectedGames.includes(game)) {
      ctx.wizard.state.selectedGames.push(game);
      ctx.wizard.state.availableGames = ctx.wizard.state.availableGames.filter(g => g !== game);
    }
    if (ctx.wizard.state.availableGames.length === 0) {
      await ctx.reply('Вы выбрали все доступные игры.');
      ctx.wizard.state.currentGameIndex = 0;
      const currentGame = ctx.wizard.state.selectedGames[ctx.wizard.state.currentGameIndex];
      const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5'];
      await ctx.reply(
        `Какой ранг в ${currentGame}?`,
        Markup.keyboard([...ranksForGame, 'Пропустить']).oneTime().resize()
      );
      return ctx.wizard.next();
    } else {
      await ctx.reply(
        `Вы выбрали: ${ctx.wizard.state.selectedGames.join(', ')}.\nВыберите еще игру или нажмите "Готово" для завершения.`,
        Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово']).oneTime().resize()
      );
      return;
    }
  },
  async (ctx) => {
    // Сбор рангов для выбранных игр
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите ранг из списка или нажмите "Пропустить".');
      return;
    }
    const rank = ctx.message.text.trim();
    const currentGame = ctx.wizard.state.selectedGames[ctx.wizard.state.currentGameIndex];
    const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5', 'Пропустить'];

    if (rank === 'Пропустить') {
      ctx.wizard.state.selectedRanks.push(null); // Помечаем, что ранг не выбран
    } else if (!ranksForGame.includes(rank)) {
      await ctx.reply(
        `Пожалуйста, выберите ранг для ${currentGame} из списка или нажмите "Пропустить".`,
        Markup.keyboard([...ranksForGame, 'Пропустить']).oneTime().resize()
      );
      return;
    } else {
      ctx.wizard.state.selectedRanks.push(rank);
    }

    ctx.wizard.state.currentGameIndex += 1;
    if (ctx.wizard.state.currentGameIndex < ctx.wizard.state.selectedGames.length) {
      const nextGame = ctx.wizard.state.selectedGames[ctx.wizard.state.currentGameIndex];
      const nextRanksForGame = gameRanks[nextGame] || ['1', '2', '3', '4', '5'];
      await ctx.reply(
        `Какой ранг в ${nextGame}?`,
        Markup.keyboard([...nextRanksForGame, 'Пропустить']).oneTime().resize()
      );
      return;
    } else {
      ctx.wizard.state.data.gameRanks = ctx.wizard.state.selectedGames.map((game, index) => ({
        game,
        rank: ctx.wizard.state.selectedRanks[index]
      }));
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
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите время игры из списка или нажмите "Готово".');
      return;
    }
    const playTime = ctx.message.text;
    if (playTime === 'Готово') {
      if (ctx.wizard.state.data.playTime.length === 0) {
        await ctx.reply('Вы не выбрали ни одного времени игры. Пожалуйста, выберите хотя бы один вариант.');
        return;
      }
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
      return;
    }
    if (!ctx.wizard.state.data.playTime.includes(playTime)) {
      ctx.wizard.state.data.playTime.push(playTime);
      ctx.wizard.state.availablePlayTimes = ctx.wizard.state.availablePlayTimes.filter(pt => pt !== playTime);
    }
    await ctx.reply(
      `Вы выбрали: ${ctx.wizard.state.data.playTime.join(', ')}.\nВыберите еще или нажмите "Готово" для завершения.`,
      Markup.keyboard([...ctx.wizard.state.availablePlayTimes, 'Готово']).oneTime().resize()
    );
    return;
  },
  async (ctx) => {
    // Шаг выбора языка
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите язык из списка или нажмите "Готово".');
      return;
    }
    const language = ctx.message.text;
    if (language === 'Готово') {
      if (ctx.wizard.state.data.language.length === 0) {
        await ctx.reply('Вы не выбрали ни одного языка. Пожалуйста, выберите хотя бы один вариант.');
        return;
      }
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
      return;
    }
    if (!ctx.wizard.state.data.language.includes(language)) {
      ctx.wizard.state.data.language.push(language);
      ctx.wizard.state.availableLanguages = ctx.wizard.state.availableLanguages.filter(lang => lang !== language);
    }
    await ctx.reply(
      `Вы выбрали: ${ctx.wizard.state.data.language.join(', ')}.\nВыберите еще или нажмите "Готово" для завершения.`,
      Markup.keyboard([...ctx.wizard.state.availableLanguages, 'Готово']).oneTime().resize()
    );
    return;
  },
  async (ctx) => {
    // Шаг выбора программ для общения
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите программу из списка или нажмите "Готово".');
      return;
    }
    const tool = ctx.message.text;
    if (tool === 'Готово') {
      if (ctx.wizard.state.data.communicationTool.length === 0) {
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
        'Пожалуйста, выберите программу из списка или нажмите "Готово" для завершения выбора.',
        Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
      );
      return;
    }
    if (!ctx.wizard.state.data.communicationTool.includes(tool)) {
      ctx.wizard.state.data.communicationTool.push(tool);
      ctx.wizard.state.availableCommunicationTools = ctx.wizard.state.availableCommunicationTools.filter(t => t !== tool);
    }
    await ctx.reply(
      `Вы выбрали: ${ctx.wizard.state.data.communicationTool.join(', ')}.\nВыберите еще или нажмите "Готово" для завершения.`,
      Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
    );
    return;
  },
  async (ctx) => {
    // Шаг выбора часового пояса
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
    console.log('findWizard Step 0');
    ctx.wizard.state.searchCriteria = {};
    ctx.wizard.state.selectedGames = [];
    ctx.wizard.state.selectedRanks = [];
    await ctx.reply(
      'Выберите критерии поиска (можно выбрать несколько):',
      Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа', 'Поиск']).oneTime().resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    console.log('findWizard Step 1');
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите критерий из списка или нажмите "Поиск".');
      return;
    }
    const choice = ctx.message.text;
    console.log('User choice:', choice);
    if (choice === 'Поиск') {
      if (Object.keys(ctx.wizard.state.searchCriteria).length === 0) {
        await ctx.reply('Вы не выбрали ни одного критерия. Пожалуйста, выберите хотя бы один.');
        return;
      }
      // Выполняем поиск
      const query = {};

      if (ctx.wizard.state.searchCriteria.games) {
        if (ctx.wizard.state.searchCriteria.gameRanks && ctx.wizard.state.searchCriteria.gameRanks.length > 0) {
          // Ищем по комбинации игры и ранга
          query['gameRanks'] = {
            $elemMatch: {
              $or: ctx.wizard.state.searchCriteria.gameRanks.map(gr => {
                return { game: gr.game, rank: gr.rank };
              })
            }
          };
        } else {
          // Ищем только по играм, независимо от ранга
          query['gameRanks.game'] = { $in: ctx.wizard.state.searchCriteria.games };
        }
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

      // Логирование для отладки
      console.log('Search Criteria:', ctx.wizard.state.searchCriteria);
      console.log('MongoDB Query:', JSON.stringify(query, null, 2));

      try {
        const results = await User.find(query).exec();
        console.log('Search Results:', results);
        ctx.wizard.state.searchResults = results;
        // Вызов функции следующего шага напрямую
        ctx.wizard.selectStep(4); // Устанавливаем шаг
        return await ctx.wizard.steps[4](ctx); // Вызываем функцию шага
      } catch (err) {
        console.error('Ошибка при выполнении поиска:', err);
        await ctx.reply('Произошла ошибка при выполнении поиска. Пожалуйста, попробуйте позже.');
        return ctx.scene.leave();
      }
    }
    switch (choice) {
      case 'Игра':
        ctx.wizard.state.availableGames = [...availableGames];
        ctx.wizard.state.searchCriteria.games = [];
        ctx.wizard.state.searchCriteria.gameRanks = [];
        await ctx.reply(
          'Выберите игру (можно выбрать несколько):',
          Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'games';
        return ctx.wizard.next();
      case 'Ранг':
        if (!ctx.wizard.state.searchCriteria.games || ctx.wizard.state.searchCriteria.games.length === 0) {
          await ctx.reply('Сначала выберите игры, для которых хотите указать ранги.', Markup.keyboard(['Игра', 'Поиск']).oneTime().resize());
          return;
        }
        ctx.wizard.state.currentGameIndex = 0;
        ctx.wizard.state.searchCriteria.gameRanks = [];
        await askForRankSearch(ctx);
        return ctx.wizard.selectStep(3);
      case 'Пол':
        ctx.wizard.state.currentFilter = 'gender';
        await ctx.reply(
          'Выберите пол:',
          Markup.keyboard([...genderOptions, 'Готово']).oneTime().resize()
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
      case 'Программа':
        ctx.wizard.state.availableCommunicationTools = [...communicationOptions];
        ctx.wizard.state.searchCriteria.communicationTool = [];
        await ctx.reply(
          'Выберите программы для общения (можно выбрать несколько):',
          Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'communicationTool';
        return ctx.wizard.next();
      default:
        await ctx.reply('Пожалуйста, выберите критерий из списка или нажмите "Поиск".', Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа', 'Поиск']).oneTime().resize());
        return;
    }
  },
  async (ctx) => {
    console.log('findWizard Step 2');
    // Обработка выбора значений для критериев (кроме рангов)
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите из списка или нажмите "Готово".');
      return;
    }
    const currentFilter = ctx.wizard.state.currentFilter;
    const value = ctx.message.text;
    console.log(`User selected ${value} for ${currentFilter}`);
    if (value === 'Готово') {
      await ctx.reply(
        'Выберите критерии поиска (или нажмите "Поиск" для начала):',
        Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа', 'Поиск']).oneTime().resize()
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
        availableOptions = [...genderOptions, 'Готово'];
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
      return;
    }
    if (currentFilter === 'gender') {
      ctx.wizard.state.searchCriteria[currentFilter] = value;
    } else if (currentFilter === 'games') {
      if (!ctx.wizard.state.searchCriteria.games.includes(value)) {
        ctx.wizard.state.searchCriteria.games.push(value);
        ctx.wizard.state.availableGames = ctx.wizard.state.availableGames.filter(g => g !== value);
      }
    } else {
      if (!ctx.wizard.state.searchCriteria[currentFilter].includes(value)) {
        ctx.wizard.state.searchCriteria[currentFilter].push(value);
        availableOptions.splice(availableOptions.indexOf(value), 1);
      }
    }
    await ctx.reply(
      `Вы выбрали: ${Array.isArray(ctx.wizard.state.searchCriteria[currentFilter]) ? ctx.wizard.state.searchCriteria[currentFilter].join(', ') : ctx.wizard.state.searchCriteria[currentFilter]}.\nВыберите еще или нажмите "Готово" для завершения.`,
      Markup.keyboard([...availableOptions, 'Готово']).oneTime().resize()
    );
    return;
  },
  async (ctx) => {
    console.log('findWizard Step 3');
    // Шаг выбора рангов для выбранных игр (в поиске)
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите ранг из списка или нажмите "Пропустить".');
      return;
    }
    const rank = ctx.message.text.trim();
    const currentGame = ctx.wizard.state.searchCriteria.games[ctx.wizard.state.currentGameIndex];
    const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5', 'Пропустить'];

    if (rank === 'Пропустить') {
      // Если ранг не выбран, просто пропускаем
    } else if (!ranksForGame.includes(rank)) {
      await ctx.reply(
        `Пожалуйста, выберите ранг для ${currentGame} из списка или нажмите "Пропустить".`,
        Markup.keyboard([...ranksForGame, 'Пропустить']).oneTime().resize()
      );
      return;
    } else {
      ctx.wizard.state.searchCriteria.gameRanks.push({ game: currentGame, rank });
    }

    ctx.wizard.state.currentGameIndex += 1;
    if (ctx.wizard.state.currentGameIndex < ctx.wizard.state.searchCriteria.games.length) {
      const nextGame = ctx.wizard.state.searchCriteria.games[ctx.wizard.state.currentGameIndex];
      const nextRanksForGame = gameRanks[nextGame] || ['1', '2', '3', '4', '5'];
      await ctx.reply(
        `Выберите ранг для ${nextGame}:`,
        Markup.keyboard([...nextRanksForGame, 'Пропустить']).oneTime().resize()
      );
      return;
    } else {
      await ctx.reply(
        'Выберите критерии поиска (или нажмите "Поиск" для начала):',
        Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа', 'Поиск']).oneTime().resize()
      );
      return ctx.wizard.selectStep(1);
    }
  },
  async (ctx) => {
    console.log('findWizard Step 4 - Displaying results');
    const results = ctx.wizard.state.searchResults;
    if (results.length === 0) {
      await ctx.reply('Не найдено пользователей по вашему запросу.');
    } else {
      for (const user of results) {
        try {
          console.log(`Processing user: ${user.telegramId}`);
          // Получаем среднюю оценку пользователя
          const reviews = await Review.find({ reviewedUserId: user.telegramId });
          const averageRating = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 'Нет оценок';

          // Формируем сообщение с информацией о пользователе
          let response = `<b>👤 @${escapeHTML(user.username) || 'не указан'}</b>\n`;
          response += `<b>Возраст:</b> ${user.age}\n`;
          response += `<b>Пол:</b> ${user.gender}\n`;
          response += `<b>Игры и ранги:</b>\n`;

          // Проверяем наличие gameRanks
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
          response += `<b>Средняя оценка:</b> ${averageRating}\n`;

          // Отправляем сообщение с кнопками
          await ctx.replyWithHTML(response, Markup.inlineKeyboard([
            [Markup.button.callback('Оставить отзыв', `leave_review_${user.telegramId}`)],
            [Markup.button.callback('Просмотреть отзывы', `view_reviews_${user.telegramId}`)]
          ]));
          console.log(`Sent info for user: ${user.telegramId}`);
        } catch (error) {
          console.error('Ошибка при обработке пользователя:', error);
        }
      }
    }
    return ctx.scene.leave();
  }
);

// Функции для запросов ранга в поиске
async function askForRankSearch(ctx) {
  const currentGameIndex = ctx.wizard.state.currentGameIndex;
  const selectedGames = ctx.wizard.state.searchCriteria.games;
  const currentGame = selectedGames[currentGameIndex];
  const ranksForGame = gameRanks[currentGame] || ['1', '2', '3', '4', '5'];
  await ctx.reply(
    `Выберите ранг для ${currentGame}:`,
    Markup.keyboard([...ranksForGame, 'Пропустить']).oneTime().resize()
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

    // Проверяем наличие gameRanks
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

// Обработчик нажатий на кнопки
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data.startsWith('leave_review_')) {
    const reviewedUserId = data.split('_')[2];
    ctx.session.reviewedUserId = reviewedUserId;
    await ctx.reply('Пожалуйста, введите вашу оценку от 1 до 5:');
    // Переходим в режим ожидания оценки
    ctx.session.waitingForRating = true;
  } else if (data.startsWith('view_reviews_')) {
    const reviewedUserId = data.split('_')[2];
    const reviews = await Review.find({ reviewedUserId }).populate('reviewerUserId');
    if (reviews.length === 0) {
      await ctx.reply('У этого пользователя пока нет отзывов.');
    } else {
      let response = 'Отзывы о пользователе:\n';
      reviews.forEach((review) => {
        response += `\nОт @${review.reviewerUserId.username || 'не указан'}: ${review.rating}/5\n"${review.comment || 'Без комментария'}"\n`;
      });
      await ctx.reply(response);
    }
  }
});

// Обработчик ввода оценки и комментария
bot.on('text', async (ctx, next) => {
  if (ctx.session.waitingForRating) {
    const rating = parseInt(ctx.message.text);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      await ctx.reply('Пожалуйста, введите число от 1 до 5.');
      return;
    }
    ctx.session.rating = rating;
    await ctx.reply('Пожалуйста, оставьте комментарий (или напишите "Пропустить"):');
    ctx.session.waitingForComment = true;
    ctx.session.waitingForRating = false;
  } else if (ctx.session.waitingForComment) {
    const comment = ctx.message.text !== 'Пропустить' ? ctx.message.text : '';
    // Сохраняем отзыв в базе данных
    const review = new Review({
      reviewerUserId: ctx.from.id,
      reviewedUserId: ctx.session.reviewedUserId,
      rating: ctx.session.rating,
      comment: comment,
    });
    await review.save();
    await ctx.reply('Спасибо за ваш отзыв!');
    // Очищаем сессию
    ctx.session.waitingForComment = false;
    ctx.session.rating = null;
    ctx.session.reviewedUserId = null;
  } else {
    // Если нет ожидания ввода оценки или комментария, передаем управление дальше
    return next();
  }
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
