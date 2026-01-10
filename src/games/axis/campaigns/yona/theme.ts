import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: false,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #04140d 0%,' +
    ' #0b2a1c 24%,' +
    ' #0f3b26 50%,' +
    ' #0b2a1c 76%,' +
    ' #03100a 100%' +
    ')',

  textPrimary: 'text-emerald-100',
  textSecondary: 'text-emerald-200',
  textMuted: 'text-emerald-300/70',
  textAccent: 'text-lime-300',

  textTitle: 'text-emerald-100',
  textHeader: 'text-emerald-50',
  headerTextShadow: '0 6px 18px rgba(0, 0, 0, 0.35), 0 0 16px rgba(16, 185, 129, 0.25)',
  panelHeaderTextShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',

  border: 'border-emerald-800',
  borderLight: 'border-emerald-700',
  borderHover: 'hover:border-emerald-500',

  bgPanelFrom: 'rgba(4, 20, 13, 0.9)',
  bgPanelVia: 'rgba(11, 42, 28, 0.72)',
  bgPanelTo: 'rgba(6, 30, 18, 0.84)',

  bgHeader: 'from-emerald-900 via-emerald-700 to-lime-900',
  bgHeaderVia: '#059669',
  headerBorderColor: '#10b981',

  bgButton: 'from-emerald-700 via-emerald-600 to-emerald-800',

  bgAnswer: 'from-emerald-950/80 via-emerald-900/55 to-emerald-950/80',
  bgAnswerHover: 'hover:from-emerald-950/90 hover:via-emerald-900/70 hover:to-emerald-950/90',
  shadowAnswer: 'hover:shadow-emerald-700/40',

  bgLifeline: 'from-emerald-700 to-lime-800',
  textLifeline: 'text-emerald-50',
  borderLifeline: 'border-emerald-500',

  bgPrizeCurrent: 'bg-gradient-to-b from-emerald-700/90 via-emerald-800/90 to-emerald-900/90',
  bgPrizePassed: 'bg-emerald-950/45',
  prizeTextCurrent: 'text-emerald-100',
  prizeTextPassed: 'text-emerald-300/70',
  prizeTextFuture: 'text-emerald-200/60',
  prizeBgGuaranteed: 'bg-emerald-900/40',
  prizeTextGuaranteed: 'text-lime-200',
  prizeBorderGuaranteed: 'border-emerald-600/70',
  prizeBorderCurrent: 'border-lime-400/70',
  prizeBorderPassed: 'border-emerald-800',
  prizeGlowCurrent: 'rgba(16, 185, 129, 0.6)',

  glow: 'rgba(16, 185, 129, 0.4)',
  glowColor: '#10b981',
  glowSecondary: '#a3e635',

  borderImageColors: 'rgba(16,185,129,0.85), #052013, rgba(163,230,53,0.8)',
};
