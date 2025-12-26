import type { ThemeColors } from '@engine/types';

/**
 * Classic Millionaire theme for "Easy" campaign
 * Deep blue with purple accents - the iconic WWTBAM look
 */
export const theme: ThemeColors = {
  textPrimary: 'text-blue-100',
  textSecondary: 'text-blue-200',
  textMuted: 'text-blue-400',
  textAccent: 'text-amber-300',
  border: 'border-blue-500',
  borderLight: 'border-blue-400',
  borderHover: 'hover:border-amber-400',
  bgPanelFrom: '#0a1628',
  bgPanelVia: '#1e1b4b',
  bgPanelTo: '#0a1628',
  bgHeader: 'from-blue-800 via-indigo-700 to-blue-800',
  bgHeaderVia: '#4338ca',
  bgButton: 'from-blue-700 via-indigo-600 to-blue-700',
  bgAnswer: 'from-blue-950 via-indigo-950 to-blue-950',
  bgAnswerHover: 'hover:from-blue-900 hover:to-indigo-900',
  bgLifeline: 'from-indigo-600 to-blue-700',
  bgPrizeCurrent: 'bg-amber-600/70',
  bgPrizePassed: 'bg-blue-800/50',
  textLifeline: 'text-blue-100',
  borderLifeline: 'border-indigo-400',
  shadowAnswer: 'hover:shadow-indigo-500/50',
  glow: 'rgba(99, 102, 241, 0.6)',
  glowColor: '#6366f1',
  glowSecondary: '#3b82f6',
  borderImageColors: '#6366f1, #0a1628',
  headerBorderColor: '#4338ca',
};
