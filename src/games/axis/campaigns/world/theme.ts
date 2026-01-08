import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: true,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #ffffff 0%,' +
    ' #f0f9ff 18%,' +
    ' #bae6fd 48%,' +
    ' #60a5fa 70%,' +
    ' #e0f2fe 100%' +
    ')',

  textPrimary: 'text-slate-800',
  textSecondary: 'text-slate-700',
  textMuted: 'text-slate-600',
  textAccent: 'text-sky-700',

  textTitle: 'text-slate-700',
  textHeader: 'text-white/95',
  headerTextShadow: '0 4px 18px rgba(15, 23, 42, 0.18), 0 0 22px rgba(56, 189, 248, 0.45)',
  panelHeaderTextShadow: '0 1px 2px rgba(15, 23, 42, 0.22)',

  border: 'border-sky-300',
  borderLight: 'border-sky-200',
  borderHover: 'hover:border-sky-400',

  bgPanelFrom: 'rgba(255, 255, 255, 0.92)',
  bgPanelVia: 'rgba(224, 242, 254, 0.82)',
  bgPanelTo: 'rgba(255, 255, 255, 0.9)',

  bgHeader: 'from-sky-400 via-sky-300 to-blue-400',
  bgHeaderVia: '#7dd3fc',
  headerBorderColor: '#38bdf8',

  bgButton: 'from-sky-500 via-sky-400 to-sky-500',

  bgAnswer: 'from-white/75 via-sky-50/70 to-white/75',
  bgAnswerHover: 'hover:from-white/85 hover:via-sky-100/75 hover:to-white/85',
  shadowAnswer: 'hover:shadow-sky-400/50',

  bgLifeline: 'from-sky-500 to-blue-500',
  textLifeline: 'text-white',
  borderLifeline: 'border-sky-200',

  bgPrizeCurrent: 'bg-sky-500/25',
  bgPrizePassed: 'bg-blue-500/15',

  glow: 'rgba(56, 189, 248, 0.55)',
  glowColor: '#38bdf8',
  glowSecondary: '#60a5fa',

  borderImageColors: '#38bdf8, rgba(255,255,255,0.55), #60a5fa',
};
