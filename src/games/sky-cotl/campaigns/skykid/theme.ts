import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: true,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #f8fafc 0%,' + // near-white
    ' #e0f2fe 18%,' + // sky-100
    ' #7dd3fc 48%,' + // sky-300
    ' #38bdf8 68%,' + // sky-400
    ' #22c55e 100%' + // grass
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

  bgPanelFrom: 'rgba(255, 255, 255, 0.90)',
  bgPanelVia: 'rgba(224, 242, 254, 0.80)', // sky-100
  bgPanelTo: 'rgba(255, 255, 255, 0.88)',

  bgHeader: 'from-sky-400 via-sky-300 to-emerald-400',
  bgHeaderVia: '#7dd3fc',
  headerBorderColor: '#38bdf8',

  bgButton: 'from-sky-500 via-sky-400 to-sky-500',

  bgAnswer: 'from-white/70 via-sky-50/70 to-white/70',
  bgAnswerHover: 'hover:from-white/80 hover:via-sky-100/70 hover:to-white/80',
  shadowAnswer: 'hover:shadow-sky-400/50',

  bgLifeline: 'from-emerald-500 to-sky-500',
  textLifeline: 'text-white',
  borderLifeline: 'border-sky-200',

  bgPrizeCurrent: 'bg-sky-500/25',
  bgPrizePassed: 'bg-emerald-500/15',

  glow: 'rgba(56, 189, 248, 0.55)',
  glowColor: '#38bdf8',
  glowSecondary: '#22c55e',

  borderImageColors: '#38bdf8, rgba(255,255,255,0.55), #22c55e',
};
