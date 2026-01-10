import type { GameStringsNamespace } from '@engine/types';

export const strings = {
  // Common layout
  headerTitle: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  headerSubtitle: "Baldur's Gate III Edition",
  footer: "✦ By Mystra's Grace ✦",

  // Audio controls
  musicOn: 'Выключить музыку',
  musicOff: 'Включить музыку',

  // Campaign selection screen
  introText:
    '{Искатель приключений!}\nПеред тобой испытание {на знание} {Baldur’s Gate III}.\n' +
    '{15 вопросов}, {магические подсказки}, {миллион золотых на кону}',
  selectPath: '✦ ВЫБЕРИ ПУТЬ ✦',
  startButton: 'В ПРИКЛЮЧЕНИЕ',

  // Campaign cards
  campaigns: {
    hero: { name: 'ГЕРОЙ', label: 'Легко', iconAlt: 'Hero' },
    mindflayer: { name: 'ИЛЛИТИД', label: 'Сложно', iconAlt: 'Mind Flayer' },
    darkurge: { name: 'СОБЛАЗН', label: 'Доблесть', iconAlt: 'Dark Urge' },
  },

  // Game screen: main panels
  prizeladderHeader: '✦ СОКРОВИЩЕ ✦',
  currency: 'золотых',

  // Game screen: lifelines and actions
  lifelines: {
    fifty: '50:50',
    phone: 'Послание',
    audience: 'Таверна',
    double: 'Вдохновение',
  },
  retreat: 'Забрать',

  // Game screen: lifeline panels
  lifelinePhoneHeader: '✦ МАГИЧЕСКОЕ ПОСЛАНИЕ ✦',
  lifelineAudienceHeader: '✦ РЕЗУЛЬТАТЫ ГАДАНИЯ ✦',
  lifelineSenderLabel: 'Отправитель:',
  lifelineAudienceLabel: 'Мнение таверны:',

  // Game screen: companion names
  companions: [
    { id: 'astarion', name: 'Астарион' },
    { id: 'gale', name: 'Гейл' },
    { id: 'shadowheart', name: 'Шэдоухарт' },
    { id: 'karlach', name: 'Карлах' },
  ],

  // Game screen: companion phrases
  companionPhrases: {
    confident: [
      'Я уверен, что это "{answer}"',
      'Это точно "{answer}"',
      'Селунитский свет ведёт к "{answer}"',
      'Астарион уже поднял бокал за "{answer}"',
      'Кости судьбы выпали на "{answer}"',
      "Лаэ'зель требует поставить на \"{answer}\"",
      'Гейл дал слово архимагов за "{answer}"',
      'Орфей подтвердил — "{answer}"',
      'Тьма шепчет "{answer}"',
    ],
    uncertain: [
      'Рискну сказать "{answer}"',
      'Возможно, это "{answer}"',
      'Иллитид шепчет "{answer}", но неизвестно, на нашей ли он стороне',
      'Жребий жреца лёг на "{answer}", но рука дрогнула',
      'Шёпоты Абсолюта слышат "{answer}", но они редко правы',
      'Если следовать интуиции Шэдоухарт, то "{answer}" — но без гарантий',
    ],
  },

  // End screen: victory
  victoryHeader: 'ЛЕГЕНДАРНЫЙ ГЕРОЙ',
  victoryText: 'Вы завоевали величайшее сокровище Фаэруна!',

  // End screen: defeat
  defeatHeader: 'КРИТИЧЕСКИЙ ПРОВАЛ',
  defeatText: 'Кость брошена. Неверный ответ.',

  // End screen: retreat
  retreatHeader: 'МУДРЫЙ ВЫБОР',
  retreatText: 'Разумное решение, искатель приключений',

  // End screen: Common
  newGameButton: 'В ЛАГЕРЬ',

} as const satisfies GameStringsNamespace;
