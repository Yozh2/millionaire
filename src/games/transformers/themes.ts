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
  primary: 'blue',
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
  bgButton: 'from-blue-600 via-blue-500 to-blue-600',
  bgButtonHover:
    'hover:from-blue-500 hover:via-blue-400 hover:to-blue-500',
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
 * Decepticon theme - Silver, dark red and black menacing colors
 * Inspired by Megatron's classic metallic appearance
 */
export const decepticonTheme: ThemeColors = {
  primary: 'slate',
  textPrimary: 'text-slate-100',
  textSecondary: 'text-red-300',
  textMuted: 'text-slate-400',
  textAccent: 'text-red-400',
  border: 'border-slate-400',
  borderLight: 'border-slate-500',
  borderHover: 'hover:border-red-500',
  bgPanel: 'from-zinc-950/95 via-slate-900/90 to-zinc-950/95',
  bgPanelFrom: '#09090b',
  bgPanelVia: '#1e293b',
  bgPanelTo: '#09090b',
  bgHeader: 'from-slate-600 via-slate-500 to-slate-600',
  bgHeaderVia: '#64748b',
  bgButton: 'from-red-700 via-red-600 to-red-700',
  bgButtonHover:
    'hover:from-red-600 hover:via-red-500 hover:to-red-600',
  bgAnswer: 'from-zinc-950 via-slate-900 to-zinc-950',
  bgAnswerHover: 'hover:from-slate-800 hover:to-red-950',
  bgLifeline: 'from-slate-600 to-red-800',
  bgPrizeCurrent: 'bg-red-700/70',
  bgPrizePassed: 'bg-zinc-800/50',
  textLifeline: 'text-slate-100',
  borderLifeline: 'border-red-500',
  shadowAnswer: 'hover:shadow-red-600/50',
  glow: 'rgba(220, 38, 38, 0.5)',
  glowColor: '#dc2626',
  glowSecondary: '#94a3b8',
  borderImageColors: '#64748b, #09090b',
  headerBorderColor: '#475569',
};

/**
 * Skybound theme - Orange and teal modern Earth-based colors
 */
export const skyboundTheme: ThemeColors = {
  primary: 'orange',
  textPrimary: 'text-orange-100',
  textSecondary: 'text-teal-200',
  textMuted: 'text-orange-400',
  textAccent: 'text-teal-300',
  border: 'border-orange-500',
  borderLight: 'border-orange-400',
  borderHover: 'hover:border-teal-400',
  bgPanel: 'from-slate-950/95 via-orange-950/90 to-slate-950/95',
  bgPanelFrom: '#0f172a',
  bgPanelVia: '#431407',
  bgPanelTo: '#0f172a',
  bgHeader: 'from-orange-700 via-orange-600 to-orange-700',
  bgHeaderVia: '#ea580c',
  bgButton: 'from-orange-600 via-orange-500 to-orange-600',
  bgButtonHover:
    'hover:from-orange-500 hover:via-orange-400 hover:to-orange-500',
  bgAnswer: 'from-slate-950 via-orange-950 to-slate-950',
  bgAnswerHover: 'hover:from-orange-900 hover:to-teal-950',
  bgLifeline: 'from-orange-600 to-teal-700',
  bgPrizeCurrent: 'bg-orange-600/70',
  bgPrizePassed: 'bg-slate-700/50',
  textLifeline: 'text-orange-100',
  borderLifeline: 'border-orange-400',
  shadowAnswer: 'hover:shadow-orange-500/50',
  glow: 'rgba(249, 115, 22, 0.6)',
  glowColor: '#f97316',
  glowSecondary: '#14b8a6',
  borderImageColors: '#f97316, #0f172a',
  headerBorderColor: '#ea580c',
};
