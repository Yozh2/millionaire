/**
 * Default Game Configuration
 * 
 * Minimal PoC game for testing the engine.
 * Uses oscillator sounds only, no external assets.
 * All settings are abstract and minimal.
 */

import { GameConfig, GameMode, ThemeColors } from '../../engine/types';

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
// Game Modes (just 2 for simplicity)
// ============================================

const easyMode: GameMode = {
  id: 'easy',
  name: 'EASY',
  label: 'Beginner',
  icon: EasyIcon,
  theme: defaultTheme,
  // No music - will be silent
  // No select sound - will use oscillator
};

const hardMode: GameMode = {
  id: 'hard',
  name: 'HARD',
  label: 'Expert',
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
// Sample Questions
// ============================================

const easyQuestions = [
  // Difficulty 1
  { question: 'What is 2 + 2?', answers: ['3', '4', '5', '6'], correct: 1, difficulty: 1 },
  { question: 'What color is the sky?', answers: ['Red', 'Green', 'Blue', 'Yellow'], correct: 2, difficulty: 1 },
  { question: 'How many legs does a dog have?', answers: ['2', '3', '4', '5'], correct: 2, difficulty: 1 },
  { question: 'What is the capital of France?', answers: ['London', 'Berlin', 'Paris', 'Rome'], correct: 2, difficulty: 1 },
  { question: 'What planet do we live on?', answers: ['Mars', 'Venus', 'Earth', 'Jupiter'], correct: 2, difficulty: 1 },
  // Difficulty 2
  { question: 'What is 7 × 8?', answers: ['54', '56', '58', '64'], correct: 1, difficulty: 2 },
  { question: 'Who wrote Romeo and Juliet?', answers: ['Dickens', 'Shakespeare', 'Twain', 'Hemingway'], correct: 1, difficulty: 2 },
  { question: 'What is H2O?', answers: ['Salt', 'Sugar', 'Water', 'Oil'], correct: 2, difficulty: 2 },
  { question: 'How many continents are there?', answers: ['5', '6', '7', '8'], correct: 2, difficulty: 2 },
  { question: 'What year did WW2 end?', answers: ['1943', '1944', '1945', '1946'], correct: 2, difficulty: 2 },
  // Difficulty 3
  { question: 'What is the speed of light?', answers: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'], correct: 0, difficulty: 3 },
  { question: 'Who painted the Mona Lisa?', answers: ['Michelangelo', 'Da Vinci', 'Raphael', 'Donatello'], correct: 1, difficulty: 3 },
  { question: 'What is the largest ocean?', answers: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3, difficulty: 3 },
  { question: 'What element has symbol Au?', answers: ['Silver', 'Gold', 'Copper', 'Iron'], correct: 1, difficulty: 3 },
  { question: 'In what year was the internet invented?', answers: ['1969', '1979', '1989', '1999'], correct: 0, difficulty: 3 },
];

const hardQuestions = [
  // Difficulty 1
  { question: 'What is the square root of 144?', answers: ['10', '11', '12', '13'], correct: 2, difficulty: 1 },
  { question: 'What is the chemical symbol for Sodium?', answers: ['S', 'So', 'Na', 'Sd'], correct: 2, difficulty: 1 },
  { question: 'Who discovered gravity?', answers: ['Einstein', 'Newton', 'Galileo', 'Darwin'], correct: 1, difficulty: 1 },
  { question: 'What is the longest river?', answers: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct: 1, difficulty: 1 },
  { question: 'How many bones in human body?', answers: ['186', '196', '206', '216'], correct: 2, difficulty: 1 },
  // Difficulty 2
  { question: 'What is Avogadro\'s number?', answers: ['6.02×10²³', '3.14×10²³', '9.81×10²³', '2.99×10²³'], correct: 0, difficulty: 2 },
  { question: 'Who wrote "1984"?', answers: ['Huxley', 'Orwell', 'Bradbury', 'Asimov'], correct: 1, difficulty: 2 },
  { question: 'What is the hardest natural substance?', answers: ['Titanium', 'Diamond', 'Graphene', 'Tungsten'], correct: 1, difficulty: 2 },
  { question: 'Which planet has the most moons?', answers: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correct: 1, difficulty: 2 },
  { question: 'What is the half-life of Carbon-14?', answers: ['5,730 years', '1,000 years', '10,000 years', '100 years'], correct: 0, difficulty: 2 },
  // Difficulty 3
  { question: 'What is Planck\'s constant?', answers: ['6.626×10⁻³⁴', '3.14×10⁻³⁴', '9.109×10⁻³⁴', '1.602×10⁻³⁴'], correct: 0, difficulty: 3 },
  { question: 'Who proved Fermat\'s Last Theorem?', answers: ['Euler', 'Gauss', 'Wiles', 'Riemann'], correct: 2, difficulty: 3 },
  { question: 'What is the Chandrasekhar limit?', answers: ['1.4 M☉', '2.0 M☉', '3.0 M☉', '0.5 M☉'], correct: 0, difficulty: 3 },
  { question: 'Which enzyme unzips DNA?', answers: ['Ligase', 'Polymerase', 'Helicase', 'Primase'], correct: 2, difficulty: 3 },
  { question: 'What causes the Mpemba effect?', answers: ['Evaporation', 'Convection', 'Unknown', 'Supercooling'], correct: 2, difficulty: 3 },
];

// ============================================
// Main Config
// ============================================

export const defaultConfig: GameConfig = {
  id: 'default',

  title: 'QUIZ GAME',
  subtitle: 'ENGINE TEST',

  modes: [easyMode, hardMode],

  questions: {
    easy: easyQuestions,
    hard: hardQuestions,
  },

  // No companions - Phone a Friend will be disabled
  companions: [],

  strings: {
    headerTitle: '★ QUIZ ★',

    introText: 'Test your knowledge! Answer 15 questions to win the grand prize.',
    selectPath: 'SELECT DIFFICULTY',
    startButton: '▶ START GAME',

    questionHeader: 'QUESTION #{n}',
    difficultyLabel: 'DIFFICULTY:',
    progressLabel: 'Progress:',

    lifelinesHeader: 'LIFELINES',
    prizesHeader: 'PRIZES',

    hintPhoneHeader: 'FRIEND\'S ADVICE',
    hintAudienceHeader: 'AUDIENCE POLL',
    hintSenderLabel: 'From:',
    hintAudienceLabel: 'Audience says:',

    companionPhrases: {
      confident: ['I\'m sure it\'s "{answer}"', 'Definitely "{answer}"'],
      uncertain: ['Maybe "{answer}"?', 'I think it\'s "{answer}"'],
    },

    wonTitle: '🎉 WINNER!',
    wonText: 'Congratulations! You won the grand prize!',
    wonHeader: 'VICTORY',

    lostTitle: '❌ GAME OVER',
    lostText: 'Wrong answer!',
    lostHeader: 'DEFEAT',
    correctAnswerLabel: 'Correct answer:',

    tookMoneyTitle: '💰 CASHED OUT',
    tookMoneyText: 'Smart choice!',
    tookMoneyHeader: 'PRIZE CLAIMED',

    prizeLabel: 'PRIZE:',
    newGameButton: '▶ PLAY AGAIN',

    footer: '★ Quiz Game Engine Test ★',

    musicOn: 'Mute',
    musicOff: 'Unmute',
  },

  lifelines: {
    fiftyFifty: { name: '50:50', icon: '⚡', enabled: true },
    phoneAFriend: { name: 'Phone', icon: '📞', enabled: false }, // Disabled - no companions
    askAudience: { name: 'Poll', icon: '📊', enabled: true },
    takeMoney: { name: 'Cash Out', icon: '💰', enabled: true },
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
      victory: 'Victory.mp3',  // Will fall back to oscillator
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
