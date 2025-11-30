/**
 * Transformers Game Themes
 *
 * Autobot (red/blue) and Decepticon (purple/silver) color schemes.
 */

import { ThemeColors } from '../../engine/types';

/**
 * Autobot theme - Red and blue heroic colors
 */
export const autobotTheme: ThemeColors = {
  primary: 'red',
  textPrimary: 'text-red-100',
  textSecondary: 'text-blue-200',
  textMuted: 'text-red-400',
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
  bgButton: 'from-red-600 via-red-500 to-red-600',
  bgButtonHover:
    'hover:from-red-500 hover:via-red-400 hover:to-red-500',
  bgAnswer: 'from-slate-950 via-red-950 to-slate-950',
  bgAnswerHover: 'hover:from-red-900 hover:to-blue-950',
  bgLifeline: 'from-red-600 to-blue-700',
  bgPrizeCurrent: 'bg-red-600/70',
  bgPrizePassed: 'bg-slate-700/50',
  textLifeline: 'text-red-100',
  borderLifeline: 'border-red-400',
  shadowAnswer: 'hover:shadow-red-500/50',
  glow: 'rgba(239, 68, 68, 0.6)',
  glowColor: '#ef4444',
  glowSecondary: '#3b82f6',
  borderImageColors: '#ef4444, #0f172a',
  headerBorderColor: '#dc2626',
};

/**
 * Decepticon theme - Purple and silver menacing colors
 */
export const decepticonTheme: ThemeColors = {
  primary: 'purple',
  textPrimary: 'text-purple-100',
  textSecondary: 'text-purple-200',
  textMuted: 'text-purple-400',
  textAccent: 'text-fuchsia-300',
  border: 'border-purple-500',
  borderLight: 'border-purple-400',
  borderHover: 'hover:border-fuchsia-400',
  bgPanel: 'from-slate-950/95 via-purple-950/90 to-slate-950/95',
  bgPanelFrom: '#0f0f1a',
  bgPanelVia: '#3b0764',
  bgPanelTo: '#0f0f1a',
  bgHeader: 'from-purple-700 via-fuchsia-600 to-purple-700',
  bgHeaderVia: '#c026d3',
  bgButton: 'from-purple-600 via-fuchsia-600 to-purple-600',
  bgButtonHover:
    'hover:from-purple-500 hover:via-fuchsia-500 hover:to-purple-500',
  bgAnswer: 'from-slate-950 via-purple-950 to-slate-950',
  bgAnswerHover: 'hover:from-purple-900 hover:to-fuchsia-950',
  bgLifeline: 'from-purple-600 to-fuchsia-700',
  bgPrizeCurrent: 'bg-purple-600/70',
  bgPrizePassed: 'bg-slate-700/50',
  textLifeline: 'text-purple-100',
  borderLifeline: 'border-fuchsia-400',
  shadowAnswer: 'hover:shadow-purple-500/50',
  glow: 'rgba(168, 85, 247, 0.6)',
  glowColor: '#a855f7',
  glowSecondary: '#d946ef',
  borderImageColors: '#a855f7, #0f0f1a',
  headerBorderColor: '#7c3aed',
};
