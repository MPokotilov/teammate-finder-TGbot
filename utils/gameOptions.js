const availableGames = ['CS2', 'Rust', 'RainbowSixSiege', 'Dota2', 'Factorio'];

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

module.exports = { availableGames, gameRanks };
