import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: true,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #fffaf0 0%,' +
    ' #fef3c7 20%,' +
    ' #f9d5a5 45%,' +
    ' #7dd3fc 72%,' +
    ' #e0f2fe 100%' +
    ')',

  textPrimary: 'text-amber-900',
  textSecondary: 'text-amber-800',
  textMuted: 'text-amber-700',
  textAccent: 'text-sky-700',

  textTitle: 'text-amber-900',
  textHeader: 'text-white/95',
  headerTextShadow: '0 4px 18px rgba(15, 23, 42, 0.18), 0 0 22px rgba(245, 158, 11, 0.32)',
  panelHeaderTextShadow: '0 1px 2px rgba(15, 23, 42, 0.2)',

  border: 'border-amber-300',
  borderLight: 'border-amber-200',
  borderHover: 'hover:border-sky-300',

  bgPanelFrom: 'rgba(255, 255, 255, 0.92)',
  bgPanelVia: 'rgba(254, 243, 199, 0.82)',
  bgPanelTo: 'rgba(255, 251, 235, 0.9)',

  bgHeader: 'from-amber-400 via-orange-300 to-sky-400',
  bgHeaderVia: '#fdba74',
  headerBorderColor: '#f59e0b',

  bgButton: 'from-amber-500 via-orange-400 to-amber-500',

  bgAnswer: 'from-white/80 via-amber-50/80 to-white/80',
  bgAnswerHover: 'hover:from-white/90 hover:via-amber-100/80 hover:to-white/90',
  shadowAnswer: 'hover:shadow-amber-400/40',

  bgLifeline: 'from-amber-500 to-sky-500',
  textLifeline: 'text-white',
  borderLifeline: 'border-amber-200',

  bgPrizeCurrent: 'bg-amber-400/30',
  bgPrizePassed: 'bg-amber-200/25',

  glow: 'rgba(245, 158, 11, 0.35)',
  glowColor: '#f59e0b',
  glowSecondary: '#38bdf8',

  borderImageColors: '#f59e0b, rgba(255,255,255,0.6), #38bdf8',
};
