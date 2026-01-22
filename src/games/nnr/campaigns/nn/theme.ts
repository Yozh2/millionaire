import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: false,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #031425 0%,' +
    ' #0a2b45 28%,' +
    ' #0b3c5f 58%,' +
    ' #020b14 100%' +
    ')',

  textPrimary: 'text-sky-100',
  textSecondary: 'text-sky-200',
  textMuted: 'text-slate-400',
  textAccent: 'text-cyan-300',

  textTitle: 'text-sky-100',
  textHeader: 'text-sky-100',
  headerTextShadow:
    '0 6px 18px rgba(0, 0, 0, 0.45), 0 0 18px rgba(0, 170, 255, 0.4)',
  panelHeaderTextShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',

  border: 'border-sky-800',
  borderLight: 'border-sky-600',
  borderHover: 'hover:border-sky-400',

  bgPanelFrom: 'rgba(3, 16, 28, 0.88)',
  bgPanelVia: 'rgba(6, 28, 46, 0.75)',
  bgPanelTo: 'rgba(3, 14, 26, 0.92)',

  bgHeader: 'from-sky-900 via-sky-700 to-blue-900',
  bgHeaderVia: '#00AAFF',
  headerBorderColor: '#1b4b7a',

  bgButton: 'from-sky-700 via-blue-600 to-sky-800',

  bgAnswer: 'from-slate-950/80 via-sky-900/45 to-slate-950/80',
  bgAnswerHover:
    'hover:from-slate-950/90 hover:via-sky-900/60 hover:to-slate-950/90',
  shadowAnswer: 'hover:shadow-sky-700/40',

  bgLifeline: 'from-sky-700 to-blue-800',
  textLifeline: 'text-slate-100',
  borderLifeline: 'border-sky-500',

  bgPrizeCurrent:
    'bg-gradient-to-b from-sky-700/90 via-blue-800/90 to-blue-900/90',
  bgPrizePassed: 'bg-slate-950/40',
  prizeTextCurrent: 'text-sky-100',
  prizeTextPassed: 'text-slate-400',
  prizeTextFuture: 'text-slate-300',
  prizeBgGuaranteed: 'bg-sky-900/40',
  prizeTextGuaranteed: 'text-sky-200',
  prizeBorderGuaranteed: 'border-sky-700',
  prizeBorderCurrent: 'border-sky-300/80',
  prizeBorderPassed: 'border-sky-800',
  prizeGlowCurrent: 'rgba(0, 170, 255, 0.55)',

  glow: 'rgba(0, 170, 255, 0.4)',
  glowColor: '#00AAFF',
  glowSecondary: '#38bdf8',
  campaignCardGlow: 'rgba(0, 170, 255, 0.5)',
  campaignCardGlowColor: '#00AAFF',
  campaignCardGlowSecondary: '#38bdf8',

  borderImageColors: 'rgba(0, 170, 255, 0.85), #0a2b45, #041824',
};
