import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: false,

  bgGradient:
    'linear-gradient(90deg,' +
    ' #020202 0%,' +
    ' #0b0c0d 32%,' +
    ' #1d2024 62%,' +
    ' #020507 100%' +
    ')',

  textPrimary: 'text-sky-50',
  textSecondary: 'text-sky-100',
  textMuted: 'text-slate-400',
  textAccent: 'text-sky-50',

  textTitle: 'text-zinc-50',
  textHeader: 'text-sky-50',
  headerTextShadow:
    '0 6px 18px rgba(0, 0, 0, 0.62), 0 0 18px rgba(0, 170, 255, 0.35)',
  panelHeaderTextShadow: '0 2px 6px rgba(0, 0, 0, 0.65)',

  border: 'border-orange-700',
  borderLight: 'border-orange-400',
  borderHover: 'hover:border-sky-300 active:border-sky-300',

  panelGradientDirection: '180deg',
  bgPanelFrom: 'rgba(5, 6, 7, 0.97)',
  bgPanelVia: 'rgba(43, 47, 51, 0.78)',
  bgPanelTo: 'rgba(2, 3, 4, 0.98)',

  headerGradientClass: 'bg-gradient-to-r',
  bgHeader: 'from-black via-zinc-700 to-black',
  bgHeaderVia: '#71717a',
  headerBorderColor: '#ff7a18',

  bgButton: 'from-sky-500 via-sky-700 to-sky-950',
  buttonBorder: 'border-sky-300',
  buttonGlow: 'rgba(0, 170, 255, 0.52)',

  bgAnswer: 'from-zinc-950/92 via-zinc-900/78 to-black',
  bgAnswerHover: 'hover:from-zinc-900 hover:via-zinc-800/82 hover:to-black',
  shadowAnswer: 'hover:shadow-sky-500/35 active:shadow-sky-500/45',

  bgLifeline: 'from-sky-800 via-sky-900 to-sky-950',
  textLifeline: 'text-sky-50',
  borderLifeline: 'border-sky-400',

  bgPrizeCurrent: 'bg-sky-400',
  bgPrizePassed: 'bg-zinc-950/45',
  prizeTextCurrent: 'text-black',
  prizeTextPassed: 'text-slate-400',
  prizeTextFuture: 'text-sky-100',
  prizeBgGuaranteed: 'bg-zinc-950/55',
  prizeTextGuaranteed: 'text-sky-200',
  prizeBorderGuaranteed: 'border-sky-500',
  prizeBorderCurrent: 'border-sky-500',
  prizeBorderPassed: 'border-zinc-800',
  prizeGlowCurrent: 'rgba(0, 170, 255, 0.48)',

  glow: 'rgba(255, 122, 24, 0.24)',
  glowColor: '#00AAFF',
  glowSecondary: '#38bdf8',
  campaignCardGlow: 'rgba(0, 170, 255, 0.5)',
  campaignCardGlowColor: '#00AAFF',
  campaignCardGlowSecondary: '#38bdf8',
  campaignCardSurfaceClass:
    'bg-gradient-to-b from-sky-800/66 via-sky-900/38 to-slate-950/92',
  campaignCardFrameClass: 'border-sky-950/70',
  campaignCardLabelClass: 'text-slate-200/85',
  campaignCardIdleBorderColor: '#123e55',

  borderImageGradientDirection: '180deg',
  borderImageColors: 'rgba(255, 183, 77, 0.95), #ff7a18, #7c2d12',
};
