import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  primary: 'ikeman',
  isLight: false,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #020617 0%,' + // slate-950
    ' #0b1220 26%,' + // near slate-900
    ' #111827 55%,' + // gray-900
    ' #24090b 78%,' + // subtle deep red (bottom warmth)
    ' #000000 100%' + // black
    ')',

  textPrimary: 'text-slate-100',
  textSecondary: 'text-slate-200',
  textMuted: 'text-slate-400',
  textAccent: 'text-red-200',

  textTitle: 'text-white/95',
  textHeader: 'text-red-950',
  headerGradientClass: 'bg-gradient-to-b',
  headerTextShadow: '0 6px 18px rgba(0, 0, 0, 0.30)',
  headerTextBackdrop:
    'radial-gradient(ellipse at center, rgba(239,68,68,0.18) 12%, rgba(2,6,23,0.25) 55%, rgba(0,0,0,0) 78%)',
  panelHeaderTextShadow: '0 1px 1px rgba(255, 255, 255, 0.35)',

  border: 'border-slate-700',
  borderLight: 'border-slate-600',
  borderHover: 'hover:border-slate-500',

  bgPanel: 'from-slate-950/75 via-slate-900/60 to-slate-950/75',
  bgPanelFrom: 'rgba(2, 6, 23, 0.86)',
  bgPanelVia: 'rgba(15, 23, 42, 0.64)',
  bgPanelTo: 'rgba(36, 9, 11, 0.70)',

  // Panel headers: white on top → silver on bottom (more explicit)
  // Panel headers: white on top → darker silver → very dark bottom
  bgHeader: 'from-white via-slate-300 to-slate-950',
  bgHeaderVia: '#cbd5e1',
  loadingBgColor: '#00AAFF',
  headerBorderColor: '#ef4444',

  bgButton: 'from-red-800 via-red-700 to-red-900',
  bgButtonHover: 'hover:from-red-700 hover:via-red-600 hover:to-red-800',

  bgAnswer: 'from-slate-950/70 via-slate-900/55 to-slate-950/70',
  bgAnswerHover: 'hover:from-slate-950/80 hover:via-slate-900/60 hover:to-slate-950/80',
  shadowAnswer: 'hover:shadow-red-500/25',

  bgLifeline: 'from-red-700 to-slate-900',
  textLifeline: 'text-white',
  borderLifeline: 'border-slate-600',

  // Current row should read as "red-accented"
  bgPrizeCurrent: 'bg-gradient-to-b from-red-800 via-red-700 to-red-900',
  bgPrizePassed: 'bg-slate-900/35',
  prizeTextCurrent: 'text-red-50',
  prizeTextPassed: 'text-slate-400',
  prizeTextFuture: 'text-slate-300',
  prizeBgGuaranteed: 'bg-red-950/35',
  prizeTextGuaranteed: 'text-red-300',
  prizeBorderGuaranteed: 'border-red-800/70',
  prizeBorderCurrent: 'border-red-500/60',
  prizeBorderPassed: 'border-slate-700',
  prizeGlowCurrent: 'rgba(239, 68, 68, 0.70)',

  glow: 'rgba(239, 68, 68, 0.30)',
  glowColor: '#ef4444',
  glowSecondary: '#e2e8f0',

  // Panel borders: light/silver on top → red on bottom (flipped)
  borderImageColors: 'rgba(255,255,255,0.85), #94a3b8, #ef4444',
};
