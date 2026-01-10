import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: false,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #020617 0%,' +
    ' #0b1630 24%,' +
    ' #0f1f44 48%,' +
    ' #0b3a5c 72%,' +
    ' #030712 100%' +
    ')',

  textPrimary: 'text-sky-100',
  textSecondary: 'text-sky-200',
  textMuted: 'text-slate-400',
  textAccent: 'text-cyan-300',

  textTitle: 'text-white/95',
  textHeader: 'text-sky-100',
  headerTextShadow: '0 6px 18px rgba(0, 0, 0, 0.35), 0 0 16px rgba(14, 165, 233, 0.25)',
  panelHeaderTextShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',

  border: 'border-sky-800',
  borderLight: 'border-sky-700',
  borderHover: 'hover:border-sky-500',

  bgPanelFrom: 'rgba(2, 6, 23, 0.88)',
  bgPanelVia: 'rgba(15, 23, 42, 0.72)',
  bgPanelTo: 'rgba(12, 32, 54, 0.82)',

  bgHeader: 'from-sky-900 via-sky-700 to-blue-900',
  bgHeaderVia: '#0ea5e9',
  headerBorderColor: '#0284c7',

  bgButton: 'from-sky-700 via-sky-600 to-sky-800',

  bgAnswer: 'from-slate-950/80 via-sky-900/55 to-slate-950/80',
  bgAnswerHover: 'hover:from-slate-950/90 hover:via-sky-900/65 hover:to-slate-950/90',
  shadowAnswer: 'hover:shadow-sky-700/40',

  bgLifeline: 'from-sky-700 to-blue-800',
  textLifeline: 'text-slate-100',
  borderLifeline: 'border-sky-600',

  bgPrizeCurrent: 'bg-gradient-to-b from-sky-700/90 via-sky-800/90 to-blue-900/90',
  bgPrizePassed: 'bg-slate-950/40',
  prizeTextCurrent: 'text-sky-100',
  prizeTextPassed: 'text-slate-400',
  prizeTextFuture: 'text-slate-300',
  prizeBgGuaranteed: 'bg-sky-900/40',
  prizeTextGuaranteed: 'text-sky-200',
  prizeBorderGuaranteed: 'border-sky-700',
  prizeBorderCurrent: 'border-sky-400/80',
  prizeBorderPassed: 'border-sky-800',
  prizeGlowCurrent: 'rgba(14, 165, 233, 0.55)',

  glow: 'rgba(14, 165, 233, 0.45)',
  glowColor: '#0ea5e9',
  glowSecondary: '#38bdf8',

  borderImageColors: 'rgba(14,165,233,0.85), #0b1630, #1e3a8a',
};
