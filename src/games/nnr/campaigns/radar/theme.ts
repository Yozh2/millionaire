import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: false,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #041815 0%,' +
    ' #0b2b24 28%,' +
    ' #0b3b34 58%,' +
    ' #03110e 100%' +
    ')',

  textPrimary: 'text-emerald-100',
  textSecondary: 'text-emerald-200',
  textMuted: 'text-slate-400',
  textAccent: 'text-cyan-300',

  textTitle: 'text-emerald-100',
  textHeader: 'text-emerald-100',
  headerTextShadow:
    '0 6px 18px rgba(0, 0, 0, 0.45), 0 0 18px rgba(99, 215, 146, 0.35)',
  panelHeaderTextShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',

  border: 'border-emerald-800',
  borderLight: 'border-emerald-600',
  borderHover: 'hover:border-emerald-400',

  bgPanelFrom: 'rgba(4, 21, 18, 0.88)',
  bgPanelVia: 'rgba(7, 35, 30, 0.75)',
  bgPanelTo: 'rgba(4, 20, 18, 0.92)',

  bgHeader: 'from-emerald-900 via-teal-800 to-emerald-900',
  bgHeaderVia: '#2b8f6b',
  headerBorderColor: '#1f5f4d',

  bgButton: 'from-emerald-700 via-emerald-600 to-teal-800',

  bgAnswer: 'from-slate-950/80 via-emerald-900/45 to-slate-950/80',
  bgAnswerHover:
    'hover:from-slate-950/90 hover:via-emerald-900/60 hover:to-slate-950/90',
  shadowAnswer: 'hover:shadow-emerald-700/40',

  bgLifeline: 'from-emerald-700 to-teal-800',
  textLifeline: 'text-slate-100',
  borderLifeline: 'border-emerald-500',

  bgPrizeCurrent:
    'bg-gradient-to-b from-emerald-700/90 via-teal-800/90 to-emerald-900/90',
  bgPrizePassed: 'bg-slate-950/40',
  prizeTextCurrent: 'text-emerald-100',
  prizeTextPassed: 'text-slate-400',
  prizeTextFuture: 'text-slate-300',
  prizeBgGuaranteed: 'bg-emerald-900/40',
  prizeTextGuaranteed: 'text-emerald-200',
  prizeBorderGuaranteed: 'border-emerald-700',
  prizeBorderCurrent: 'border-emerald-300/80',
  prizeBorderPassed: 'border-emerald-800',
  prizeGlowCurrent: 'rgba(99, 215, 146, 0.55)',

  glow: 'rgba(99, 215, 146, 0.4)',
  glowColor: '#63D792',
  glowSecondary: '#2dd4bf',
  campaignCardGlow: 'rgba(99, 215, 146, 0.5)',
  campaignCardGlowColor: '#63D792',
  campaignCardGlowSecondary: '#2dd4bf',

  borderImageColors: 'rgba(99, 215, 146, 0.85), #0b2b24, #0a1d19',
};
