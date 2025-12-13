/**
 * Sky: Children of the Light - Theme
 *
 * Soft sky tones: white clouds, blue sky, green grass.
 */

import type { ThemeColors } from '../../engine/types';

export const skyJourneyTheme: ThemeColors = {
  primary: 'sky',
  isLight: true,

  // Full-screen background: sky → horizon → grass
  bgGradient:
    'linear-gradient(180deg,' +
    ' #eaf7ff 0%,' + // cloud-white
    ' #bfe9ff 18%,' + // pale sky
    ' #7dd3fc 55%,' + // sky
    ' #60a5fa 70%,' + // deep sky
    ' #22c55e 100%' + // grass
    ')',

  // Body text
  textPrimary: 'text-slate-800',
  textSecondary: 'text-slate-700',
  textMuted: 'text-slate-600',
  textAccent: 'text-sky-700',

  // Header text
  textTitle: 'text-slate-700',
  textHeader: 'text-white/95',
  headerTextShadow: '0 4px 18px rgba(15, 23, 42, 0.18), 0 0 22px rgba(56, 189, 248, 0.35)',
  headerTextBackdrop:
    'radial-gradient(ellipse at center, rgba(255,255,255,0.82) 18%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 78%)',
  panelHeaderTextShadow: '0 1px 2px rgba(15, 23, 42, 0.22)',

  border: 'border-sky-300',
  borderLight: 'border-sky-200',
  borderHover: 'hover:border-sky-400',

  // Panels are "cloud glass"
  bgPanel: 'from-white/85 via-sky-50/80 to-white/85',
  bgPanelFrom: 'rgba(255, 255, 255, 0.90)',
  bgPanelVia: 'rgba(224, 242, 254, 0.80)', // sky-100
  bgPanelTo: 'rgba(255, 255, 255, 0.88)',

  // Header & buttons keep a readable sky gradient
  bgHeader: 'from-sky-400 via-sky-300 to-sky-400',
  bgHeaderVia: '#7dd3fc',
  headerBorderColor: '#38bdf8',

  bgButton: 'from-sky-500 via-sky-400 to-sky-500',
  bgButtonHover: 'hover:from-sky-400 hover:via-sky-300 hover:to-sky-400',

  bgAnswer: 'from-white/70 via-sky-50/70 to-white/70',
  bgAnswerHover: 'hover:from-white/80 hover:via-sky-100/70 hover:to-white/80',
  shadowAnswer: 'hover:shadow-sky-400/50',

  bgLifeline: 'from-emerald-500 to-sky-500',
  textLifeline: 'text-white',
  borderLifeline: 'border-sky-200',

  bgPrizeCurrent: 'bg-sky-500/30',
  bgPrizePassed: 'bg-emerald-500/15',

  glow: 'rgba(56, 189, 248, 0.55)',
  glowColor: '#38bdf8',
  glowSecondary: '#22c55e',

  borderImageColors: '#38bdf8, rgba(255,255,255,0.55), #22c55e',
};
