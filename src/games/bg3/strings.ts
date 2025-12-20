import type { Companion, GameStrings } from '@engine/types';

export const bg3Title = 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ';
export const bg3Subtitle = "Baldur's Gate III Edition";

export const bg3CampaignStrings = {
  hero: { name: 'ГЕРОЙ', label: 'Легко', iconAlt: 'Hero' },
  mindFlayer: { name: 'ИЛЛИТИД', label: 'Сложно', iconAlt: 'Mind Flayer' },
  darkUrge: { name: 'СОБЛАЗН', label: 'Доблесть', iconAlt: 'Dark Urge' },
} as const;

export const bg3Companions: Companion[] = [
  { id: 'astarion', name: 'Астарион' },
  { id: 'gale', name: 'Гейл' },
  { id: 'shadowheart', name: 'Шэдоухарт' },
  { id: 'karlach', name: 'Карлах' },
];

export const bg3Strings: GameStrings = {
  introText:
    '{Искатель приключений!}\nПеред тобой испытание {на знание} {Baldur’s Gate III}.\n' +
    '{15 вопросов}, {магические подсказки}, {миллион золотых на кону}',
  selectPath: '✦ ВЫБЕРИ ПУТЬ ✦',
  startButton: 'В ПРИКЛЮЧЕНИЕ',

  questionHeader: '#{n}',

  prizesHeader: '✦ СОКРОВИЩЕ ✦',

  lifelinePhoneHeader: '✦ МАГИЧЕСКОЕ ПОСЛАНИЕ ✦',
  lifelineAudienceHeader: '✦ РЕЗУЛЬТАТЫ ГАДАНИЯ ✦',
  lifelineSenderLabel: 'Отправитель:',
  lifelineAudienceLabel: 'Мнение таверны:',

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

  wonTitle: 'ЛЕГЕНДАРНЫЙ ГЕРОЙ',
  wonText: 'Вы завоевали величайшее сокровище Фаэруна!',
  wonHeader: 'КВЕСТ ЗАВЕРШЁН',

  lostTitle: 'КРИТИЧЕСКИЙ ПРОВАЛ',
  lostText: 'Кость брошена. Неверный ответ.',
  lostHeader: 'КВЕСТ ПРОВАЛЕН',
  correctAnswerLabel: 'Правильный ответ:',

  tookMoneyTitle: 'МУДРЫЙ ВЫБОР',
  tookMoneyText: 'Разумное решение, искатель приключений',
  tookMoneyHeader: 'НАГРАДА ПОЛУЧЕНА',

  newGameButton: 'В ЛАГЕРЬ',

  footer: "✦ By Mystra's Grace ✦",

  musicOn: 'Выключить музыку',
  musicOff: 'Включить музыку',
};

export const bg3LifelineNames = {
  fifty: '50:50',
  phone: 'Послание',
  audience: 'Таверна',
  double: 'Вдохновение',
} as const;

export const bg3ActionNames = {
  takeMoney: 'Забрать',
} as const;

export const bg3Currency = 'золотых';
