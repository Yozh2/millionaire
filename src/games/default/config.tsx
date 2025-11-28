/**
 * Default Game Configuration
 *
 * Minimal PoC game for testing the engine.
 * Uses oscillator sounds only, no external assets.
 * All settings are abstract and minimal.
 */

import { GameConfig, Campaign, ThemeColors } from '../../engine/types';

// ============================================
// Minimal Theme
// ============================================

const defaultTheme: ThemeColors = {
  primary: 'slate',
  textPrimary: 'text-slate-300',
  textSecondary: 'text-slate-400',
  textMuted: 'text-slate-600',
  textAccent: 'text-slate-200',
  border: 'border-slate-700',
  borderLight: 'border-slate-500',
  borderHover: 'hover:border-slate-500',
  bgPanel: 'from-slate-900/90 via-slate-800/95 to-slate-950/90',
  bgPanelFrom: '#1e293b',
  bgPanelVia: '#334155',
  bgPanelTo: '#0f172a',
  bgHeader: 'from-slate-700 via-slate-600 to-slate-700',
  bgHeaderVia: '#475569',
  bgButton: 'from-slate-600 via-slate-700 to-slate-800',
  bgButtonHover: 'hover:from-slate-500 hover:via-slate-600 hover:to-slate-700',
  bgAnswer: 'from-slate-800 via-slate-900 to-slate-950',
  bgAnswerHover: 'hover:from-slate-700 hover:to-slate-800',
  bgLifeline: 'from-slate-600 to-slate-800',
  bgPrizeCurrent: 'bg-slate-700/60',
  bgPrizePassed: 'bg-slate-800/40',
  textLifeline: 'text-slate-100',
  borderLifeline: 'border-slate-400',
  shadowAnswer: 'hover:shadow-slate-700/50',
  glow: 'rgba(148, 163, 184, 0.5)',
  glowColor: '#94a3b8',
  glowSecondary: '#64748b',
  borderImageColors: '#475569, #1e293b',
  headerBorderColor: '#1e293b',
};

// ============================================
// Simple Icons (emoji-based)
// ============================================

const EasyIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center text-4xl">
    🟢
  </div>
);

const HardIcon = () => (
  <div className="w-16 h-16 mx-auto flex items-center justify-center text-4xl">
    🔴
  </div>
);

const TrophyIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl animate-bounce">
    🏆
  </div>
);

const FailIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    ❌
  </div>
);

const MoneyIcon = () => (
  <div className="w-24 h-24 mx-auto flex items-center justify-center text-6xl">
    💰
  </div>
);

// ============================================
// Campaigns (just 2 for simplicity)
// ============================================

const easyCampaign: Campaign = {
  id: 'easy',
  name: 'ЛЕГКО',
  label: 'Новичок',
  icon: EasyIcon,
  theme: defaultTheme,
  // No music - will be silent
  // No select sound - will use oscillator
};

const hardCampaign: Campaign = {
  id: 'hard',
  name: 'СЛОЖНО',
  label: 'Эксперт',
  icon: HardIcon,
  theme: {
    ...defaultTheme,
    primary: 'rose',
    textPrimary: 'text-rose-400',
    textSecondary: 'text-rose-300',
    border: 'border-rose-800',
    borderLight: 'border-rose-600',
    bgHeader: 'from-rose-900 via-rose-800 to-rose-900',
    bgButton: 'from-rose-700 via-rose-800 to-rose-900',
    glow: 'rgba(244, 63, 94, 0.5)',
    glowColor: '#f43f5e',
  },
};

// ============================================
// Sample Questions (на русском языке)
// ============================================

const easyQuestions = [
  // Difficulty 1
  { question: 'Сколько будет 2 + 2?', answers: ['3', '4', '5', '6'], correct: 1, difficulty: 1 },
  { question: 'Какого цвета небо?', answers: ['Красное', 'Зелёное', 'Голубое', 'Жёлтое'], correct: 2, difficulty: 1 },
  { question: 'Сколько ног у собаки?', answers: ['2', '3', '4', '5'], correct: 2, difficulty: 1 },
  { question: 'Столица Франции?', answers: ['Лондон', 'Берлин', 'Париж', 'Рим'], correct: 2, difficulty: 1 },
  { question: 'На какой планете мы живём?', answers: ['Марс', 'Венера', 'Земля', 'Юпитер'], correct: 2, difficulty: 1 },
  // Difficulty 2
  { question: 'Сколько будет 7 × 8?', answers: ['54', '56', '58', '64'], correct: 1, difficulty: 2 },
  { question: 'Кто написал "Ромео и Джульетту"?', answers: ['Диккенс', 'Шекспир', 'Твен', 'Хемингуэй'], correct: 1, difficulty: 2 },
  { question: 'Что такое H2O?', answers: ['Соль', 'Сахар', 'Вода', 'Масло'], correct: 2, difficulty: 2 },
  { question: 'Сколько континентов на Земле?', answers: ['5', '6', '7', '8'], correct: 2, difficulty: 2 },
  { question: 'В каком году закончилась Вторая мировая война?', answers: ['1943', '1944', '1945', '1946'], correct: 2, difficulty: 2 },
  // Difficulty 3
  { question: 'Какова скорость света?', answers: ['300,000 км/с', '150,000 км/с', '500,000 км/с', '1,000,000 км/с'], correct: 0, difficulty: 3 },
  { question: 'Кто написал "Мону Лизу"?', answers: ['Микеланджело', 'Да Винчи', 'Рафаэль', 'Донателло'], correct: 1, difficulty: 3 },
  { question: 'Какой океан самый большой?', answers: ['Атлантический', 'Индийский', 'Северный Ледовитый', 'Тихий'], correct: 3, difficulty: 3 },
  { question: 'Какой элемент обозначается Au?', answers: ['Серебро', 'Золото', 'Медь', 'Железо'], correct: 1, difficulty: 3 },
  { question: 'В каком году был изобретён интернет?', answers: ['1969', '1979', '1989', '1999'], correct: 0, difficulty: 3 },
];

const hardQuestions = [
  // Difficulty 1
  { question: 'Чему равен квадратный корень из 144?', answers: ['10', '11', '12', '13'], correct: 2, difficulty: 1 },
  { question: 'Какой химический символ у натрия?', answers: ['S', 'So', 'Na', 'Sd'], correct: 2, difficulty: 1 },
  { question: 'Кто открыл закон всемирного тяготения?', answers: ['Эйнштейн', 'Ньютон', 'Галилей', 'Дарвин'], correct: 1, difficulty: 1 },
  { question: 'Какая река самая длинная?', answers: ['Амазонка', 'Нил', 'Янцзы', 'Миссисипи'], correct: 1, difficulty: 1 },
  { question: 'Сколько костей в теле человека?', answers: ['186', '196', '206', '216'], correct: 2, difficulty: 1 },
  // Difficulty 2
  { question: 'Чему равно число Авогадро?', answers: ['6,02×10²³', '3,14×10²³', '9,81×10²³', '2,99×10²³'], correct: 0, difficulty: 2 },
  { question: 'Кто написал роман "1984"?', answers: ['Хаксли', 'Оруэлл', 'Брэдбери', 'Азимов'], correct: 1, difficulty: 2 },
  { question: 'Какое самое твёрдое природное вещество?', answers: ['Титан', 'Алмаз', 'Графен', 'Вольфрам'], correct: 1, difficulty: 2 },
  { question: 'У какой планеты больше всего спутников?', answers: ['Юпитер', 'Сатурн', 'Уран', 'Нептун'], correct: 1, difficulty: 2 },
  { question: 'Каков период полураспада углерода-14?', answers: ['5,730 лет', '1,000 лет', '10,000 лет', '100 лет'], correct: 0, difficulty: 2 },
  // Difficulty 3
  { question: 'Чему равна постоянная Планка?', answers: ['6,626×10⁻³⁴', '3,14×10⁻³⁴', '9,109×10⁻³⁴', '1,602×10⁻³⁴'], correct: 0, difficulty: 3 },
  { question: 'Кто доказал Великую теорему Ферма?', answers: ['Эйлер', 'Гаусс', 'Уайлс', 'Риман'], correct: 2, difficulty: 3 },
  { question: 'Каков предел Чандрасекара?', answers: ['1,4 M☉', '2,0 M☉', '3,0 M☉', '0,5 M☉'], correct: 0, difficulty: 3 },
  { question: 'Какой фермент расплетает ДНК?', answers: ['Лигаза', 'Полимераза', 'Геликаза', 'Праймаза'], correct: 2, difficulty: 3 },
  { question: 'Что вызывает эффект Мпембы?', answers: ['Испарение', 'Конвекция', 'Неизвестно', 'Переохлаждение'], correct: 2, difficulty: 3 },
];

// ============================================
// Main Config
// ============================================

export const defaultConfig: GameConfig = {
  id: 'default',

  title: 'КТО ХОЧЕТ СТАТЬ МИЛЛИОНЕРОМ',
  subtitle: 'ТЕСТ ДВИЖКА',

  campaigns: [easyCampaign, hardCampaign],

  questions: {
    easy: easyQuestions,
    hard: hardQuestions,
  },

  // No companions - Phone a Friend will be disabled
  companions: [],

  strings: {
    headerTitle: '★ ВИКТОРИНА ★',

    introText: 'Проверь свои знания! Ответь на 15 вопросов, чтобы выиграть главный приз.',
    selectPath: 'ВЫБЕРИТЕ СЛОЖНОСТЬ',
    startButton: '▶ НАЧАТЬ ИГРУ',

    questionHeader: 'ВОПРОС #{n}',
    difficultyLabel: 'СЛОЖНОСТЬ:',
    progressLabel: 'Прогресс:',

    lifelinesHeader: 'ПОДСКАЗКИ',
    prizesHeader: 'ПРИЗЫ',

    hintPhoneHeader: 'СОВЕТ ДРУГА',
    hintAudienceHeader: 'ОПРОС ЗАЛА',
    hintSenderLabel: 'От:',
    hintAudienceLabel: 'Зал считает:',

    companionPhrases: {
      confident: ['Я уверен, что это "{answer}"', 'Точно "{answer}"'],
      uncertain: ['Может быть "{answer}"?', 'Думаю, это "{answer}"'],
    },

    wonTitle: '🎉 ПОБЕДА!',
    wonText: 'Поздравляем! Вы выиграли главный приз!',
    wonHeader: 'ПОБЕДА',

    lostTitle: '❌ ИГРА ОКОНЧЕНА',
    lostText: 'Неправильный ответ!',
    lostHeader: 'ПОРАЖЕНИЕ',
    correctAnswerLabel: 'Правильный ответ:',

    tookMoneyTitle: '💰 ДЕНЬГИ ЗАБРАНЫ',
    tookMoneyText: 'Умный выбор!',
    tookMoneyHeader: 'ПРИЗ ПОЛУЧЕН',

    prizeLabel: 'ПРИЗ:',
    newGameButton: '▶ ИГРАТЬ СНОВА',

    footer: '★ Тестовый движок викторины ★',

    musicOn: 'Выкл. музыку',
    musicOff: 'Вкл. музыку',
  },

  lifelines: {
    fiftyFifty: { name: '50:50', icon: '⚡', enabled: true },
    phoneAFriend: { name: 'Звонок', icon: '📞', enabled: false }, // Disabled - no companions
    askAudience: { name: 'Зал', icon: '📊', enabled: true },
    takeMoney: { name: 'Забрать', icon: '💰', enabled: true },
  },

  prizes: {
    values: [
      '$100', '$200', '$300', '$500', '$1,000',
      '$2,000', '$4,000', '$8,000', '$16,000', '$32,000',
      '$64,000', '$125,000', '$250,000', '$500,000', '$1,000,000',
    ],
    guaranteed: [4, 9, 14],
    currency: '',
  },

  audio: {
    musicVolume: 0.2,
    soundVolume: 1.0,
    voiceVolume: 1.0,
    // No tracks - all silent or oscillator
    sounds: {
      click: 'Click.mp3',      // Will fall back to oscillator
      correct: 'Correct.mp3',  // Will fall back to oscillator
      money: 'Money.mp3',      // Will fall back to oscillator
      defeat: 'Defeat.mp3',    // Will fall back to oscillator
    },
  },

  endIcons: {
    won: TrophyIcon,
    lost: FailIcon,
    tookMoney: MoneyIcon,
  },
};

export default defaultConfig;
