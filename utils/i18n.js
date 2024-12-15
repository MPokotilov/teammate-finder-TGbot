module.exports = {
    texts: {
      en: {
        // General
        greeting: '🔥 Hello, champion! 🔥\n\nReady to assemble the dream team? I\'m here to help! 🚀\n\n👉 Use /register to begin.\n\nTime to play and win! 🎮',
        language_choice: 'Please choose your language:',
        help: '/start - Start\n/register - Register or update your profile\n/find - Find teammates\n/profile - View your profile\n/help - Show this message\n/report - Report a problem',
        profile_no_profile: 'You don\'t have a profile yet. Use /register to create one.',
        profile_main: '<b>Your profile:</b>\nAge: {age}\nGender: {gender}\nGames and ranks:\n{games}\nPlay Time: {playTime}\nLanguage: {language}\nTime Zone: {timeZone}\nCommunication Tools: {tools}',
        game_info_line: '• {game}: {rank}',
        no_game_info: 'No games info.\n',
        search_criteria_prompt: 'Choose search criteria (or use "search"):',
        choose_game_more_or_done: 'You selected: {games}\nChoose more or "done".',
        search_results_none: 'No users found for your query.',
        search_completed: 'Search completed.',
        report_prompt: 'Please describe the problem you encountered, in as much detail as possible.',
        report_thanks: 'Thank you for your report! We will look into the problem soon.',
        error_msg: 'An error occurred. Please try again later.',
        language_selected: 'Language selected: {lang}',
        choose_language_prompt: 'Please choose your language:',
  
        // Registration
        reg_start: 'Let\'s create your profile! How old are you?',
        reg_age_error: 'Please provide a valid age.',
        reg_gender_prompt: 'Choose your gender:',
        reg_gender_error: 'Please choose a valid gender.',
        reg_games_prompt: 'Select the games you play (you can choose multiple):',
        reg_games_chosen: 'You selected: {games}.\nChoose more or "done".',
        reg_games_none: 'You didn\'t choose any game. Please choose at least one.',
        reg_rank_prompt: 'What rank in {game}?',
        reg_rank_error: 'Please choose a valid rank.',
        reg_playtime_prompt: 'Choose your playtime (you can select multiple):',
        reg_playtime_none: 'You must select at least one playtime option.',
        reg_language_prompt: 'Choose preferred languages (you can select multiple):',
        reg_language_none: 'Please select at least one language.',
        reg_communication_prompt: 'Choose communication tools (multiple allowed):',
        reg_communication_none: 'Please select at least one communication tool.',
        reg_timezone_prompt: 'Choose your timezone:',
        reg_saving: 'Saving your profile...',
        reg_save_success: 'Your profile has been saved successfully!',
        reg_save_error: 'An error occurred while saving your profile. Please try again later.',
  
        // Find
        search_no_criteria: 'You didn\'t select any criteria. Please select at least one.',
        search_game_prompt: 'Choose a game (multiple allowed):',
        search_game_done: 'You selected: {games}.\nChoose more or "done".',
        search_game_none: 'You didn\'t choose any game. Please choose at least one.',
        search_rank_prompt: 'What rank in {game}?',
        search_rank_error: 'Please choose a valid rank.',
        search_playtime_prompt: 'Choose playtime (multiple):',
        search_playtime_none: 'Please select at least one playtime.',
        search_language_prompt: 'Choose languages (multiple):',
        search_language_none: 'Select at least one language.',
        search_timezone_prompt: 'Choose timezone (multiple):',
        search_timezone_none: 'Select at least one timezone.',
        search_program_prompt: 'Choose communication tools (multiple):',
        search_program_none: 'Select at least one tool.',
        search_return_menu: 'Choose more criteria or press "search" to start search.',

        // report.js
        report_prompt: 'Please describe the problem you encountered, in as much detail as possible.',
        report_error: 'Please describe your problem in text.',
        report_admin_message: 'New problem report:\n\nFrom: {username}\nTelegramId: {fromId}\n\nProblem:\n{problemText}',
        report_thanks: 'Thank you for your report! We will look into the problem soon.',

        // cron.js
        review_request: 'It has been 2 days since your match with {username}. Please rate your experience from 1 to 5:',
        username_not_specified: 'not specified',

        // helpers_sendProfileInfo.js
        username_not_specified: 'not specified',
        profile_age: 'Age',
        profile_gender: 'Gender',
        profile_games_and_ranks: 'Games and Ranks',
        profile_rank_not_specified: 'Not specified',
        profile_no_game_info: 'No game information.',
        profile_playtime: 'Play Time',
        profile_language: 'Language',
        profile_timezone: 'Time Zone',
        profile_communication_tools: 'Communication Tools',
        like_profile_button: 'Like Profile',

        // helpers.js
        like_error_duplicate: 'Error saving like (possibly duplicate):',
        match_found_message: 'Congratulations! You have a mutual like with a player. In 2 days, we will ask you to rate your experience of playing together.',
        profile_liked_notification: '{username} liked your profile! Here is their profile:',
        username_not_specified: 'not specified',

  
        // UI words
        male: 'Male',
        female: 'Female',
        done: 'Done',
        search: 'Search',
        english_button: 'English',
        russian_button: 'Русский',
        ukrainian_button: 'Українська',
  
        // Options (added)
        gender_male: 'Male',
        gender_female: 'Female',
        playtime_day: 'Day',
        playtime_night: 'Night',
        playtime_morning: 'Morning',
        playtime_evening: 'Evening',
        lang_english_option: 'English',
        lang_russian_option: 'Russian',
        lang_ukrainian_option: 'Ukrainian',

        help_start: 'Start working with the bot',
        help_register: 'Register or update your profile',
        help_find: 'Find teammates',
        help_profile: 'View your profile',
        help_help: 'Show command list',
        help_report: 'Report a problem'
      },
  
      ru: {
        // General
        greeting: '🔥 Здравствуй, чемпион! 🔥\n\nГотов собрать команду мечты? Я здесь, чтобы помочь! 🚀\n\n👉 Используй /register для начала.\n\nВремя играть и побеждать! 🎮',
        language_choice: 'Пожалуйста, выберите язык:',
        help: '/start - Начать\n/register - Зарегистрироваться или обновить профиль\n/find - Найти тиммейтов\n/profile - Просмотреть свой профиль\n/help - Показать это сообщение\n/report - Сообщить о проблеме',
        profile_no_profile: 'У тебя еще нет профиля. Используй /register для создания.',
        profile_main: '<b>Твой профиль:</b>\nВозраст: {age}\nПол: {gender}\nИгры и ранги:\n{games}\nВремя игры: {playTime}\nЯзык: {language}\nЧасовой пояс: {timeZone}\nПрограммы для общения: {tools}',
        game_info_line: '• {game}: {rank}',
        no_game_info: 'Нет информации об играх.\n',
        search_criteria_prompt: 'Выберите критерии поиска (или "Поиск"):',
        choose_game_more_or_done: 'Вы выбрали: {games}\nВыберите еще или "Готово".',
        search_results_none: 'Не найдено пользователей по вашему запросу.',
        search_completed: 'Поиск завершен.',
        report_prompt: 'Опишите, пожалуйста, проблему, с которой вы столкнулись, как можно подробнее.',
        report_thanks: 'Спасибо за ваш отчет! Мы постараемся решить проблему в ближайшее время.',
        error_msg: 'Произошла ошибка. Пожалуйста, попробуйте позже.',
        language_selected: 'Язык выбран: {lang}',
        choose_language_prompt: 'Пожалуйста, выберите язык:',
  
        // Registration
        reg_start: 'Давайте создадим ваш профиль! Сколько вам лет?',
        reg_age_error: 'Пожалуйста, введите корректный возраст.',
        reg_gender_prompt: 'Выберите ваш пол:',
        reg_gender_error: 'Пожалуйста, выберите корректный пол.',
        reg_games_prompt: 'Выберите игры, в которые вы играете (можно несколько):',
        reg_games_chosen: 'Вы выбрали: {games}.\nВыберите еще или "Готово".',
        reg_games_none: 'Вы не выбрали ни одной игры. Пожалуйста, выберите хотя бы одну.',
        reg_rank_prompt: 'Какой ранг в {game}?',
        reg_rank_error: 'Пожалуйста, выберите корректный ранг.',
        reg_playtime_prompt: 'Выберите время игры (можно несколько):',
        reg_playtime_none: 'Вы должны выбрать хотя бы один вариант времени.',
        reg_language_prompt: 'Выберите предпочитаемые языки (можно несколько):',
        reg_language_none: 'Пожалуйста, выберите хотя бы один язык.',
        reg_communication_prompt: 'Выберите программы для общения (можно несколько):',
        reg_communication_none: 'Пожалуйста, выберите хотя бы одну программу.',
        reg_timezone_prompt: 'Выберите ваш часовой пояс:',
        reg_saving: 'Сохраняю ваш профиль...',
        reg_save_success: 'Ваш профиль успешно сохранен!',
        reg_save_error: 'Произошла ошибка при сохранении профиля. Пожалуйста, попробуйте позже.',
  
        // Find
        search_no_criteria: 'Вы не выбрали ни одного критерия. Пожалуйста, выберите хотя бы один.',
        search_game_prompt: 'Выберите игру (можно несколько):',
        search_game_done: 'Вы выбрали: {games}.\nВыберите еще или "Готово".',
        search_game_none: 'Вы не выбрали ни одной игры. Пожалуйста, выберите хотя бы одну.',
        search_rank_prompt: 'Какой ранг в {game}?',
        search_rank_error: 'Пожалуйста, выберите корректный ранг.',
        search_playtime_prompt: 'Выберите время игры (несколько):',
        search_playtime_none: 'Выберите хотя бы один вариант времени.',
        search_language_prompt: 'Выберите языки (несколько):',
        search_language_none: 'Выберите хотя бы один язык.',
        search_timezone_prompt: 'Выберите часовой пояс (несколько):',
        search_timezone_none: 'Выберите хотя бы один часовый пояс.',
        search_program_prompt: 'Выберите программы для общения (несколько):',
        search_program_none: 'Выберите хотя бы одну программу.',
        search_return_menu: 'Выберите дополнительные критерии или нажмите "Поиск" для начала.',

        // report.js
        report_prompt: 'Опишите, пожалуйста, проблему, с которой вы столкнулись. Чем подробнее, тем лучше!',
        report_error: 'Пожалуйста, опишите вашу проблему текстом.',
        report_admin_message: 'Новый репорт о проблеме:\n\nОт: {username}\nTelegramId: {fromId}\n\nПроблема:\n{problemText}',
        report_thanks: 'Спасибо за ваш отчет! Мы постараемся решить проблему в ближайшее время.',

        //cron.js
        review_request: 'Прошло 2 суток с момента вашего матча с {username}. Пожалуйста, оцените ваш игровой опыт от 1 до 5:',
        username_not_specified: 'не указан',

        // helpers_sendProfileInfo.js
        username_not_specified: 'не указан',
        profile_age: 'Возраст',
        profile_gender: 'Пол',
        profile_games_and_ranks: 'Игры и ранги',
        profile_rank_not_specified: 'Не указан',
        profile_no_game_info: 'Нет информации об играх.',
        profile_playtime: 'Время игры',
        profile_language: 'Язык',
        profile_timezone: 'Часовой пояс',
        profile_communication_tools: 'Программы для общения',
        like_profile_button: 'Понравился профиль',

        // helpers.js
        like_error_duplicate: 'Ошибка при сохранении лайка (возможно дубликат):',
        match_found_message: 'Поздравляем! У вас взаимный лайк с игроком. Через 2 суток мы попросим вас оценить опыт игры друг с другом.',
        profile_liked_notification: 'Ваш профиль понравился {username}! Вот его профиль:',
        username_not_specified: 'не указан',
  
        // UI words
        male: 'Мужской',
        female: 'Женский',
        done: 'Готово',
        search: 'Поиск',
        english_button: 'English',
        russian_button: 'Русский',
        ukrainian_button: 'Українська',
  
        // Options (added)
        gender_male: 'Мужской',
        gender_female: 'Женский',
        playtime_day: 'День',
        playtime_night: 'Ночь',
        playtime_morning: 'Утро',
        playtime_evening: 'Вечер',
        lang_english_option: 'Английский',
        lang_russian_option: 'Русский',
        lang_ukrainian_option: 'Украинский',

        help_start: 'Начать работу с ботом',
        help_register: 'Зарегистрироваться или обновить профиль',
        help_find: 'Найти тиммейтов',
        help_profile: 'Просмотреть свой профиль',
        help_help: 'Показать список команд',
        help_report: 'Сообщить о проблеме'
      },
  
      ua: {
        // General
        greeting: '🔥 Привіт, чемпіоне! 🔥\n\nГотовий зібрати команду мрії? Я тут, щоб допомогти! 🚀\n\n👉 Використовуй /register щоб почати.\n\nЧас грати та перемагати! 🎮',
        language_choice: 'Будь ласка, оберіть мову:',
        help: '/start - Почати\n/register - Зареєструватися або оновити профіль\n/find - Знайти команду\n/profile - Переглянути свій профіль\n/help - Показати це повідомлення\n/report - Повідомити про проблему',
        profile_no_profile: 'У тебе ще немає профілю. Використовуй /register для створення.',
        profile_main: '<b>Твій профіль:</b>\nВік: {age}\nСтать: {gender}\nІгри та ранги:\n{games}\nЧас гри: {playTime}\nМова: {language}\nЧасовий пояс: {timeZone}\nПрограми для спілкування: {tools}',
        game_info_line: '• {game}: {rank}',
        no_game_info: 'Немає інформації про ігри.\n',
        search_criteria_prompt: 'Виберіть критерії пошуку (або "Поиск"):',
        choose_game_more_or_done: 'Ви вибрали: {games}\nВиберіть ще або "Готово".',
        search_results_none: 'Не знайдено користувачів за вашим запитом.',
        search_completed: 'Пошук завершено.',
        report_prompt: 'Будь ласка, опишіть проблему, з якою ви зіткнулися, якомога детальніше.',
        report_thanks: 'Дякуємо за ваш звіт! Ми постараємося вирішити проблему найближчим часом.',
        error_msg: 'Сталася помилка. Будь ласка, спробуйте пізніше.',
        language_selected: 'Мову вибрано: {lang}',
        choose_language_prompt: 'Будь ласка, оберіть мову:',
  
        // Registration
        reg_start: 'Створимо ваш профіль! Скільки вам років?',
        reg_age_error: 'Будь ласка, введіть коректний вік.',
        reg_gender_prompt: 'Оберіть вашу стать:',
        reg_gender_error: 'Будь ласка, оберіть коректну стать.',
        reg_games_prompt: 'Оберіть ігри, в які ви граєте (можна кілька):',
        reg_games_chosen: 'Ви вибрали: {games}.\nВиберіть ще або "Готово".',
        reg_games_none: 'Ви не вибрали жодної гри. Будь ласка, оберіть хоча б одну.',
        reg_rank_prompt: 'Який ранг у {game}?',
        reg_rank_error: 'Будь ласка, оберіть коректний ранг.',
        reg_playtime_prompt: 'Оберіть час гри (можна кілька):',
        reg_playtime_none: 'Ви маєте обрати хоча б один варіант часу.',
        reg_language_prompt: 'Оберіть мови (можна кілька):',
        reg_language_none: 'Будь ласка, оберіть хоча б одну мову.',
        reg_communication_prompt: 'Оберіть програми для спілкування (можна кілька):',
        reg_communication_none: 'Будь ласка, оберіть хоча б одну програму.',
        reg_timezone_prompt: 'Оберіть ваш часовий пояс:',
        reg_saving: 'Зберігаю ваш профіль...',
        reg_save_success: 'Ваш профіль успішно збережено!',
        reg_save_error: 'Сталася помилка при збереженні профілю. Будь ласка, спробуйте пізніше.',
  
        // Find
        search_no_criteria: 'Ви не обрали жодного критерію. Будь ласка, оберіть хоча б один.',
        search_game_prompt: 'Оберіть гру (можна кілька):',
        search_game_done: 'Ви вибрали: {games}.\nВиберіть ще або "Готово".',
        search_game_none: 'Ви не вибрали жодної гри. Будь ласка, оберіть хоча б одну.',
        search_rank_prompt: 'Який ранг у {game}?',
        search_rank_error: 'Будь ласка, оберіть коректний ранг.',
        search_playtime_prompt: 'Оберіть час гри (декілька):',
        search_playtime_none: 'Виберіть хоча б один варіант часу.',
        search_language_prompt: 'Оберіть мови (декілька):',
        search_language_none: 'Оберіть хоча б одну мову.',
        search_timezone_prompt: 'Оберіть часовий пояс (декілька):',
        search_timezone_none: 'Оберіть хоча б один часовий пояс.',
        search_program_prompt: 'Оберіть програми для спілкування (декілька):',
        search_program_none: 'Оберіть хоча б одну програму.',
        search_return_menu: 'Виберіть додаткові критерії або натисніть "Поиск" для початку пошуку.',

        // report.js
        report_prompt: 'Будь ласка, опишіть проблему, з якою ви зіткнулися, якомога детальніше.',
        report_error: 'Будь ласка, опишіть вашу проблему текстом.',
        report_admin_message: 'Новий репорт про проблему:\n\nВід: {username}\nTelegramId: {fromId}\n\nПроблема:\n{problemText}',
        report_thanks: 'Дякуємо за ваш звіт! Ми постараємося вирішити проблему найближчим часом.',

        //cron.js
        review_request: 'Минуло 2 дні з моменту вашого матчу з {username}. Оцініть ваш досвід гри від 1 до 5:',
        username_not_specified: 'не вказано',

        // helpers_sendProfileInfo.js
        username_not_specified: 'не вказано',
        profile_age: 'Вік',
        profile_gender: 'Стать',
        profile_games_and_ranks: 'Ігри та ранги',
        profile_rank_not_specified: 'Не вказано',
        profile_no_game_info: 'Немає інформації про ігри.',
        profile_playtime: 'Час гри',
        profile_language: 'Мова',
        profile_timezone: 'Часовий пояс',
        profile_communication_tools: 'Програми для спілкування',
        like_profile_button: 'Сподобався профіль',

        // helpers.js
        like_error_duplicate: 'Помилка збереження вподобання (можливо дублікат):',
        match_found_message: 'Вітаємо! У вас взаємне вподобання з гравцем. Через 2 дні ми попросимо вас оцінити досвід гри разом.',
        profile_liked_notification: 'Ваш профіль сподобався {username}! Ось його профіль:',
        username_not_specified: 'не вказано',
        
        // UI words
        male: 'Чоловіча',
        female: 'Жіноча',
        done: 'Готово',
        search: 'Поиск',
        english_button: 'English',
        russian_button: 'Русский',
        ukrainian_button: 'Українська',
  
        // Options (added)
        gender_male: 'Чоловіча',
        gender_female: 'Жіноча',
        playtime_day: 'День',
        playtime_night: 'Ніч',
        playtime_morning: 'Ранок',
        playtime_evening: 'Вечір',
        lang_english_option: 'Англійська',
        lang_russian_option: 'Російська',
        lang_ukrainian_option: 'Українська',

        help_start: 'Почати роботу з ботом',
        help_register: 'Зареєструватися або оновити профіль',
        help_find: 'Знайти команду',
        help_profile: 'Переглянути свій профіль',
        help_help: 'Показати список команд',
        help_report: 'Повідомити про проблему'
      }
    },
  
    getText(ctx, key, params = {}) {
        const lang = ctx.session?.language || 'en';
        const langTexts = this.texts[lang] || this.texts['en']; // Фоллбэк на английский язык
        let text = langTexts[key] || this.texts['en'][key] || key; // Фоллбэк на ключ
        for (const p in params) {
          text = text.replace(`{${p}}`, params[p]);
        }
        return text;
      }
    };