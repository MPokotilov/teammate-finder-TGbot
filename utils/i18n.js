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
  
        // UI words
        male: 'Male',
        female: 'Female',
        done: 'Done',
        search: 'Search',
        english_button: 'English',
        russian_button: 'Русский',
        ukrainian_button: 'Українська'
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
        search_timezone_none: 'Выберите хотя бы один часовой пояс.',
        search_program_prompt: 'Выберите программы для общения (несколько):',
        search_program_none: 'Выберите хотя бы одну программу.',
        search_return_menu: 'Выберите дополнительные критерии или нажмите "Поиск" для начала.',
  
        // UI words
        male: 'Мужской',
        female: 'Женский',
        done: 'Готово',
        search: 'Поиск',
        english_button: 'English',
        russian_button: 'Русский',
        ukrainian_button: 'Українська'
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
  
        // UI words
        male: 'Чоловіча',
        female: 'Жіноча',
        done: 'Готово',
        search: 'Поиск',
        english_button: 'English',
        russian_button: 'Русский',
        ukrainian_button: 'Українська'
      }
    },
  
    getText(ctx, key, params = {}) {
      const lang = ctx.session?.language || 'en';
      let text = this.texts[lang][key];
      for (const p in params) {
        text = text.replace(`{${p}}`, params[p]);
      }
      return text;
    }
  };
  