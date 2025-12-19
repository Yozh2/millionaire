import type { ThemeColors } from '@engine/types';

/**
 * Autobot theme - Red and blue heroic colors
 */
export const theme: ThemeColors = {
  primary: 'blue',
  textPrimary: 'text-red-100',
  textSecondary: 'text-blue-200',
  textMuted: 'text-blue-200/80',
  textAccent: 'text-blue-300',
  border: 'border-red-500',
  borderLight: 'border-red-400',
  borderHover: 'hover:border-blue-400',
  bgPanel: 'from-slate-950/95 via-red-950/90 to-slate-950/95',
  bgPanelFrom: '#0f172a',
  bgPanelVia: '#450a0a',
  bgPanelTo: '#0f172a',
  bgHeader: 'from-red-700 via-red-600 to-red-700',
  bgHeaderVia: '#dc2626',
  bgButton: 'from-blue-600 via-blue-500 to-blue-600',
  bgButtonHover: 'hover:from-blue-500 hover:via-blue-400 hover:to-blue-500',
  bgAnswer: 'from-slate-950 via-red-950 to-slate-950',
  bgAnswerHover: 'hover:from-red-900 hover:to-blue-950',
  bgLifeline: 'from-red-600 to-blue-700',
  bgPrizeCurrent: 'bg-blue-700/70',
  bgPrizePassed: 'bg-blue-950/35',
  prizeBorderCurrent: 'border-blue-300',
  prizeBorderPassed: 'border-blue-800',
  prizeGlowCurrent: 'rgba(59, 130, 246, 0.6)',
  textLifeline: 'text-red-100',
  borderLifeline: 'border-red-400',
  shadowAnswer: 'hover:shadow-red-500/50',
  glow: 'rgba(239, 68, 68, 0.6)',
  glowColor: '#ef4444',
  glowSecondary: '#3b82f6',
  borderImageColors: '#ef4444, #0f172a',
  headerBorderColor: '#dc2626',
};
