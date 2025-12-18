import type { ThemeColors } from '@engine/types';

/**
 * Decepticon theme - Silver, dark red and black menacing colors
 * Inspired by Megatron's classic metallic appearance
 */
export const theme: ThemeColors = {
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
  bgButtonHover: 'hover:from-red-600 hover:via-red-500 hover:to-red-600',
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
