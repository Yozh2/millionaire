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
  questionHeader: '#{n}',
  prizesHeader: '✦ СОКРОВИЩЕ ✦',

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
      'По-моему, правильный ответ — "{answer}"',
      'Это точно "{answer}"',
      'Селюнский свет ведёт к "{answer}"',
      'Астарион уже поднимает бокал за "{answer}"',
      'Кости судьбы выпали на "{answer}"',
      'Даже Мысличный червь не спорит: "{answer}"',
      "Лаэ'зель потребовала поставить на \"{answer}\"",
      'Гейл дал слово архимагов за "{answer}"',
      'Орфей подтвердил — "{answer}"',
      'Моя тьма сверхразума шепчет "{answer}"',
    ],
    uncertain: [
      'Думаю, что это "{answer}"',
      'Рискну сказать "{answer}"',
      'Возможно, это "{answer}"',
      'Гадаю на кости — может, "{answer}"',
      'Оракул в Урдене шепчет про "{answer}", но не уверен',
      'Иллитид в голове показывает "{answer}", хотя картинка расплывчата',
      'Жребий жреца лёг на "{answer}", но рука дрогнула',
      'Шепоты Абсолюта слышат "{answer}", но они редко правы',
      'Эндаревы карты склоняются к "{answer}"',
      'Если следовать интуиции Шэдоухарт, то "{answer}" — но без гарантий',
      'Побочный эффект тэдпола шепчет про "{answer}"',
    ],
  },

  // End screen: Common
  newGameButton: 'В ЛАГЕРЬ',
  currency: 'золотых',

  // End screen: victory
  victoryText: 'Вы завоевали величайшее сокровище Фаэруна!',
  victoryHeader: 'ЛЕГЕНДАРНЫЙ ГЕРОЙ',

  // End screen: defeat
  defeatText: 'Кость брошена. Неверный ответ.',
  defeatHeader: 'КРИТИЧЕСКИЙ ПРОВАЛ',
  correctAnswerLabel: 'Правильный ответ:',

  // End screen: retreat
  retreatText: 'Разумное решение, искатель приключений',
  retreatHeader: 'МУДРЫЙ ВЫБОР',

} as const satisfies GameStringsNamespace;
