import type { ThemeColors } from '@engine/types';

/**
 * v6 goals:
 * - Prize ladder "current" row MUST NOT read as white: use warm wax fill + amber text.
 * - Answer buttons:
 *   - Idle: white inside, but semi-transparent (glassy).
 *   - Hover/Selected: still white, but with a vertical bi-directional gradient
 *     (brighter top + brighter bottom, slightly less bright center) to mimic "glare".
 *
 * Note: your selected state likely reuses bgAnswerHover. This is tuned for that.
 */
export const theme: ThemeColors = {
  isLight: true,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #fff7f1 0%,' +
    ' #f5d3e3 14%,' +
    ' #d6e6ff 32%,' +
    ' #82afe3 52%,' +
    ' #3f6fb3 70%,' +
    ' #243a7a 86%,' +
    ' #1b2557 100%' +
    ')',

  // Text
  textPrimary: 'text-slate-800',
  textSecondary: 'text-slate-700',
  textMuted: 'text-slate-600',
  textAccent: 'text-amber-600',

  textTitle: 'text-slate-700',
  textHeader: 'text-white/95',
  headerGradientClass: 'bg-gradient-to-r',

  headerTextShadow:
    '0 10px 26px rgba(27, 37, 87, 0.16), ' +
    '0 0 22px rgba(130, 175, 227, 0.14), ' +
    '0 0 16px rgba(245, 211, 227, 0.16), ' +
    '0 0 14px rgba(251, 191, 36, 0.14)',
  panelHeaderTextShadow: '0 1px 2px rgba(27, 37, 87, 0.12)',

  // Borders (soft wax)
  border: 'border-amber-200/85',
  borderLight: 'border-amber-100/90',
  borderHover: 'hover:border-amber-200/95',

  // Panels (bright bottoms so no dark bleed)
  bgPanelFrom: 'rgba(255, 255, 255, 0.96)',
  bgPanelVia: 'rgba(255, 255, 255, 0.92)',
  bgPanelTo: 'rgba(239, 246, 255, 0.90)',

  // Header bar: honey wax
  bgHeader: 'from-amber-600 via-amber-400 to-amber-600',
  bgHeaderVia: '#fbbf24',
  headerBorderColor: 'rgba(251, 191, 36, 0.85)',

  // Buttons
  bgButton: 'from-amber-600 via-amber-300 to-amber-600',

  // Answers:
  // Idle: white-ish glass, semi-transparent (but not "see-through blue")
  bgAnswer: 'from-white/70 via-white/58 to-white/70',

  // Hover/Selected: bi-directional vertical glare (bright top & bottom, softer center)
  // (This reads as "lifted" + "glare sweep" when combined with your motion/highlight.)
  bgAnswerHover:
    'hover:from-white/92 hover:via-white/62 hover:to-white/90',

  shadowAnswer: 'hover:shadow-sky-200/40',

  // Lifelines: wax
  bgLifeline: 'from-amber-600 to-amber-400',
  textLifeline: 'text-white',
  borderLifeline: 'border-amber-100/90',

  // Prize ladder: make current row clearly warm (never white)
  bgPrizeCurrent: 'bg-amber-200/90',
  bgPrizePassed: 'bg-sky-200/10',
  prizeTextCurrent: 'text-amber-700',
  prizeTextPassed: 'text-slate-500',
  prizeTextFuture: 'text-slate-400',
  prizeBgGuaranteed: 'bg-amber-300/16',
  prizeTextGuaranteed: 'text-amber-800',
  prizeBorderGuaranteed: 'border-amber-200/70',
  prizeBorderCurrent: 'border-amber-200/90',
  prizeBorderPassed: 'border-sky-200/35',
  prizeGlowCurrent: 'shadow-[0_0_22px_rgba(251,191,36,0.22)]',

  // Glow
  glow: 'rgba(251, 191, 36, 0.30)',
  glowColor: '#fbbf24',
  glowSecondary: '#82AFE3',

  borderImageColors:
    'rgba(251,191,36,0.78), rgba(255,255,255,0.70), rgba(214,230,255,0.55)',
};
