import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: true,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #f6f7f2 0%,' +
    ' #e2f3e7 18%,' +
    ' #b9e4c8 46%,' +
    ' #4c9468 72%,' +
    ' #0f2a1e 100%' +
    ')',

  textPrimary: 'text-emerald-900',
  textSecondary: 'text-emerald-800',
  textMuted: 'text-emerald-700',
  textAccent: 'text-lime-700',

  textTitle: 'text-emerald-900',
  textHeader: 'text-white/95',
  headerTextShadow: '0 4px 18px rgba(15, 23, 42, 0.18), 0 0 22px rgba(16, 185, 129, 0.35)',
  panelHeaderTextShadow: '0 1px 2px rgba(15, 23, 42, 0.18)',

  border: 'border-emerald-300',
  borderLight: 'border-emerald-200',
  borderHover: 'hover:border-emerald-400',

  bgPanelFrom: 'rgba(255, 255, 255, 0.92)',
  bgPanelVia: 'rgba(236, 253, 245, 0.86)',
  bgPanelTo: 'rgba(255, 255, 255, 0.9)',

  bgHeader: 'from-emerald-600 via-emerald-500 to-lime-500',
  bgHeaderVia: '#10b981',
  headerBorderColor: '#059669',

  bgButton: 'from-emerald-600 via-emerald-500 to-emerald-600',

  bgAnswer: 'from-white/80 via-emerald-50/80 to-white/80',
  bgAnswerHover: 'hover:from-white/90 hover:via-emerald-100/80 hover:to-white/90',
  shadowAnswer: 'hover:shadow-emerald-400/40',

  bgLifeline: 'from-emerald-600 to-lime-600',
  textLifeline: 'text-white',
  borderLifeline: 'border-emerald-200',

  bgPrizeCurrent: 'bg-emerald-500/25',
  bgPrizePassed: 'bg-emerald-300/20',

  glow: 'rgba(16, 185, 129, 0.45)',
  glowColor: '#10b981',
  glowSecondary: '#84cc16',

  borderImageColors: '#10b981, rgba(255,255,255,0.6), #84cc16',
};
