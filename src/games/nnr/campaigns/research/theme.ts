import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: false,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #130f1f 0%,' +
    ' #2b1a4f 30%,' +
    ' #3b2b6d 60%,' +
    ' #0b0814 100%' +
    ')',

  textPrimary: 'text-violet-100',
  textSecondary: 'text-violet-200',
  textMuted: 'text-slate-400',
  textAccent: 'text-fuchsia-300',

  textTitle: 'text-violet-100',
  textHeader: 'text-violet-100',
  headerTextShadow:
    '0 6px 18px rgba(0, 0, 0, 0.45), 0 0 18px rgba(139, 108, 239, 0.4)',
  panelHeaderTextShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',

  border: 'border-violet-800',
  borderLight: 'border-violet-600',
  borderHover: 'hover:border-violet-400',

  bgPanelFrom: 'rgba(16, 10, 30, 0.88)',
  bgPanelVia: 'rgba(31, 18, 54, 0.75)',
  bgPanelTo: 'rgba(14, 8, 26, 0.92)',

  bgHeader: 'from-violet-900 via-purple-700 to-violet-900',
  bgHeaderVia: '#8b6cef',
  headerBorderColor: '#3b2b6d',

  bgButton: 'from-violet-700 via-purple-600 to-violet-800',

  bgAnswer: 'from-slate-950/80 via-violet-900/45 to-slate-950/80',
  bgAnswerHover:
    'hover:from-slate-950/90 hover:via-violet-900/60 hover:to-slate-950/90',
  shadowAnswer: 'hover:shadow-violet-700/40',

  bgLifeline: 'from-violet-700 to-purple-800',
  textLifeline: 'text-slate-100',
  borderLifeline: 'border-violet-500',

  bgPrizeCurrent:
    'bg-gradient-to-b from-violet-700/90 via-purple-800/90 to-violet-900/90',
  bgPrizePassed: 'bg-slate-950/40',
  prizeTextCurrent: 'text-violet-100',
  prizeTextPassed: 'text-slate-400',
  prizeTextFuture: 'text-slate-300',
  prizeBgGuaranteed: 'bg-violet-900/40',
  prizeTextGuaranteed: 'text-violet-200',
  prizeBorderGuaranteed: 'border-violet-700',
  prizeBorderCurrent: 'border-violet-300/80',
  prizeBorderPassed: 'border-violet-800',
  prizeGlowCurrent: 'rgba(139, 108, 239, 0.55)',

  glow: 'rgba(139, 108, 239, 0.4)',
  glowColor: '#8b6cef',
  glowSecondary: '#c4b5fd',
  campaignCardGlow: 'rgba(139, 108, 239, 0.5)',
  campaignCardGlowColor: '#8b6cef',
  campaignCardGlowSecondary: '#c4b5fd',

  borderImageColors: 'rgba(139, 108, 239, 0.85), #2b1a4f, #1a0f2d',
};
