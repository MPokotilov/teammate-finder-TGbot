const { Scenes, Markup } = require('telegraf');
const User = require('../models/User');
const Review = require('../models/Review');
const { escapeHTML } = require('../utils/helpers_sendProfileInfo');

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
};

const findWizard = new Scenes.WizardScene(
  'findWizard',
  async (ctx) => {
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
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите критерий или "Поиск".');
      return;
    }
    const choice = ctx.message.text;
    if (choice === 'Поиск') {
      if (Object.keys(ctx.wizard.state.searchCriteria).length === 0) {
        await ctx.reply('Вы не выбрали ни одного критерия. Пожалуйста, выберите хотя бы один.');
        return;
      }
      const query = {};
      if (ctx.wizard.state.searchCriteria.games) {
        if (ctx.wizard.state.searchCriteria.gameRanks && ctx.wizard.state.searchCriteria.gameRanks.length > 0) {
          query['gameRanks'] = {
            $elemMatch: {
              $or: ctx.wizard.state.searchCriteria.gameRanks.map(gr => ({ game: gr.game, rank: gr.rank }))
            }
          };
        } else {
          query['gameRanks.game'] = { $in: ctx.wizard.state.searchCriteria.games };
        }
      }
      if (ctx.wizard.state.searchCriteria.gender) query['gender'] = ctx.wizard.state.searchCriteria.gender;
      if (ctx.wizard.state.searchCriteria.playTime) query['playTime'] = { $in: ctx.wizard.state.searchCriteria.playTime };
      if (ctx.wizard.state.searchCriteria.language) query['language'] = { $in: ctx.wizard.state.searchCriteria.language };
      if (ctx.wizard.state.searchCriteria.timeZone) query['timeZone'] = { $in: ctx.wizard.state.searchCriteria.timeZone };
      if (ctx.wizard.state.searchCriteria.communicationTool) query['communicationTool'] = { $in: ctx.wizard.state.searchCriteria.communicationTool };

      try {
        let results = await User.find(query).exec();
        results = results.filter(u => u.telegramId !== ctx.from.id);
        ctx.wizard.state.searchResults = results;
        ctx.wizard.selectStep(4);
        return await ctx.wizard.steps[4](ctx);
      } catch (err) {
        console.error('Ошибка при поиске:', err);
        await ctx.reply('Произошла ошибка при поиске. Пожалуйста, попробуйте позже.');
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
          await ctx.reply('Сначала выберите игры для указания рангов.', Markup.keyboard(['Игра', 'Поиск']).oneTime().resize());
          return;
        }
        ctx.wizard.state.currentGameIndex = 0;
        ctx.wizard.state.searchCriteria.gameRanks = [];
        const currentGame = ctx.wizard.state.searchCriteria.games[0];
        const defaultRanksForGame = (gameRanks[currentGame] || ['1','2','3','4','5','Пропустить']);
        await ctx.reply(`Выберите ранг для ${currentGame}:`, Markup.keyboard([...defaultRanksForGame,'Пропустить']).oneTime().resize());
        return ctx.wizard.selectStep(3);
      case 'Пол':
        ctx.wizard.state.currentFilter = 'gender';
        await ctx.reply(
          'Выберите пол:',
          Markup.keyboard(['Мужской', 'Женский', 'Готово']).oneTime().resize()
        );
        return ctx.wizard.next();
      case 'Время игры':
        ctx.wizard.state.availablePlayTimes = [...playTimeOptions];
        ctx.wizard.state.searchCriteria.playTime = [];
        await ctx.reply(
          'Выберите время игры (можно несколько):',
          Markup.keyboard([...ctx.wizard.state.availablePlayTimes, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'playTime';
        return ctx.wizard.next();
      case 'Язык':
        ctx.wizard.state.availableLanguages = [...languageOptions];
        ctx.wizard.state.searchCriteria.language = [];
        await ctx.reply(
          'Выберите язык (можно несколько):',
          Markup.keyboard([...ctx.wizard.state.availableLanguages, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'language';
        return ctx.wizard.next();
      case 'Часовой пояс':
        ctx.wizard.state.availableTimeZones = [...timeZoneOptions];
        ctx.wizard.state.searchCriteria.timeZone = [];
        await ctx.reply(
          'Выберите часовой пояс (можно несколько):',
          Markup.keyboard([...ctx.wizard.state.availableTimeZones, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'timeZone';
        return ctx.wizard.next();
      case 'Программа':
        ctx.wizard.state.availableCommunicationTools = [...communicationOptions];
        ctx.wizard.state.searchCriteria.communicationTool = [];
        await ctx.reply(
          'Выберите программы для общения (можно несколько):',
          Markup.keyboard([...ctx.wizard.state.availableCommunicationTools, 'Готово']).oneTime().resize()
        );
        ctx.wizard.state.currentFilter = 'communicationTool';
        return ctx.wizard.next();
      default:
        await ctx.reply('Пожалуйста, выберите критерий или "Поиск".', Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа', 'Поиск']).oneTime().resize());
        return;
    }
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите из списка или "Готово".');
      return;
    }
    const currentFilter = ctx.wizard.state.currentFilter;
    const value = ctx.message.text;
    if (value === 'Готово') {
      await ctx.reply(
        'Выберите критерии поиска (или "Поиск"):',
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
        availableOptions = ['Мужской', 'Женский', 'Готово'];
        break;
      default:
        await ctx.reply('Ошибка. Начните заново /find.');
        return ctx.scene.leave();
    }
    if (!availableOptions.includes(value)) {
      await ctx.reply(
        'Пожалуйста, выберите из списка или "Готово".',
        Markup.keyboard([...availableOptions, 'Готово']).oneTime().resize()
      );
      return;
    }
    if (currentFilter === 'gender') {
      ctx.wizard.state.searchCriteria[currentFilter] = value;
    } else if (currentFilter === 'games') {
      if (!ctx.wizard.state.searchCriteria.games) ctx.wizard.state.searchCriteria.games = [];
      if (!ctx.wizard.state.searchCriteria.games.includes(value)) {
        ctx.wizard.state.searchCriteria.games.push(value);
        // Сразу убираем выбранную игру из availableGames
        ctx.wizard.state.availableGames = ctx.wizard.state.availableGames.filter(g => g !== value);
      }
      // После выбора игры, снова показываем обновленный список игр и "Готово"
      if (ctx.wizard.state.availableGames.length > 0) {
        await ctx.reply(
          `Вы выбрали: ${ctx.wizard.state.searchCriteria.games.join(', ')}.\nВыберите еще игру или "Готово".`,
          Markup.keyboard([...ctx.wizard.state.availableGames, 'Готово']).oneTime().resize()
        );
      } else {
        await ctx.reply(
          `Вы выбрали: ${ctx.wizard.state.searchCriteria.games.join(', ')}.\nВсе игры выбраны, нажмите "Готово" для продолжения.`,
          Markup.keyboard(['Готово']).oneTime().resize()
        );
      }
      return;
    } else {
      if (!ctx.wizard.state.searchCriteria[currentFilter]) ctx.wizard.state.searchCriteria[currentFilter] = [];
      if (!ctx.wizard.state.searchCriteria[currentFilter].includes(value)) {
        ctx.wizard.state.searchCriteria[currentFilter].push(value);
        availableOptions.splice(availableOptions.indexOf(value), 1);
      }
      await ctx.reply(
        `Вы выбрали: ${Array.isArray(ctx.wizard.state.searchCriteria[currentFilter]) ? ctx.wizard.state.searchCriteria[currentFilter].join(', ') : ctx.wizard.state.searchCriteria[currentFilter]}.\nВыберите еще или "Готово".`,
        Markup.keyboard([...availableOptions, 'Готово']).oneTime().resize()
      );
    }
    return;
  },
  async (ctx) => {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Пожалуйста, выберите ранг или "Пропустить".');
      return;
    }
    const rank = ctx.message.text.trim();
    const currentGameIndex = ctx.wizard.state.currentGameIndex || 0;
    const currentGame = ctx.wizard.state.searchCriteria.games[currentGameIndex];
    const ranksForGame = gameRanks[currentGame] ? [...gameRanks[currentGame], 'Пропустить'] : ['1','2','3','4','5','Пропустить'];
    if (rank === 'Пропустить') {
      // пропускаем
    } else if (!ranksForGame.includes(rank)) {
      await ctx.reply(
        `Пожалуйста, выберите ранг для ${currentGame} или "Пропустить".`,
        Markup.keyboard(ranksForGame).oneTime().resize()
      );
      return;
    } else {
      if (!ctx.wizard.state.searchCriteria.gameRanks) ctx.wizard.state.searchCriteria.gameRanks = [];
      ctx.wizard.state.searchCriteria.gameRanks.push({ game: currentGame, rank });
    }

    ctx.wizard.state.currentGameIndex += 1;
    if (ctx.wizard.state.currentGameIndex < ctx.wizard.state.searchCriteria.games.length) {
      const nextGame = ctx.wizard.state.searchCriteria.games[ctx.wizard.state.currentGameIndex];
      const nextRanksForGame = gameRanks[nextGame] ? [...gameRanks[nextGame], 'Пропустить'] : ['1','2','3','4','5','Пропустить'];
      await ctx.reply(
        `Выберите ранг для ${nextGame}:`,
        Markup.keyboard(nextRanksForGame).oneTime().resize()
      );
      return; 
    } else {
      await ctx.reply(
        'Выберите критерии поиска (или "Поиск"):',
        Markup.keyboard(['Игра', 'Ранг', 'Пол', 'Время игры', 'Язык', 'Часовой пояс', 'Программа', 'Поиск']).oneTime().resize()
      );
      return ctx.wizard.selectStep(1);
    }
  },
  async (ctx) => {
    const results = ctx.wizard.state.searchResults;
    if (results.length === 0) {
      await ctx.reply('Не найдено пользователей по вашему запросу.', Markup.removeKeyboard());
    } else {
      for (const user of results) {
        const reviews = await Review.find({ reviewedUserId: user.telegramId });
        const averageRating = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 'Нет оценок';

        let response = `<b>👤 @${escapeHTML(user.username) || 'не указан'}</b>\n`;
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
        response += `<b>Средняя оценка:</b> ${averageRating}\n`;

        await ctx.replyWithHTML(response, Markup.inlineKeyboard([
          [Markup.button.callback('Понравился профиль', `like_profile_${user.telegramId}`)],
          [Markup.button.callback('Просмотреть отзывы', `view_reviews_${user.telegramId}`)]
        ]));
      }
      await ctx.reply('Поиск завершен.', Markup.removeKeyboard());
    }
    return ctx.scene.leave();
  }
);

module.exports = findWizard;
