import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: false,

  bgGradient:
    'linear-gradient(90deg,' +
    ' #020202 0%,' +
    ' #06131c 32%,' +
    ' #0b1d2b 62%,' +
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
  borderHover: 'hover:border-orange-400',

  panelGradientDirection: '180deg',
  bgPanelFrom: 'rgba(2, 18, 30, 0.96)',
  bgPanelVia: 'rgba(4, 34, 52, 0.92)',
  bgPanelTo: 'rgba(1, 10, 18, 0.98)',

  headerGradientClass: 'bg-gradient-to-r',
  bgHeader: 'from-sky-950 via-sky-800 to-sky-950',
  bgHeaderVia: '#00AAFF',
  headerBorderColor: '#ff7a18',

  bgButton: 'from-sky-500 via-sky-700 to-sky-950',
  buttonBorder: 'border-sky-300',
  buttonGlow: 'rgba(0, 170, 255, 0.52)',

  bgAnswer: 'from-sky-950/85 via-sky-900/60 to-slate-950/85',
  bgAnswerHover:
    'hover:from-sky-900/95 hover:via-sky-800/70 hover:to-slate-950/95',
  shadowAnswer: 'hover:shadow-sky-500/35',

  bgLifeline: 'from-sky-800 via-sky-900 to-sky-950',
  textLifeline: 'text-sky-50',
  borderLifeline: 'border-sky-400',

  bgPrizeCurrent:
    'bg-gradient-to-b from-sky-700/95 via-sky-800/95 to-sky-950/95',
  bgPrizePassed: 'bg-sky-950/40',
  prizeTextCurrent: 'text-sky-50',
  prizeTextPassed: 'text-slate-400',
  prizeTextFuture: 'text-sky-100',
  prizeBgGuaranteed: 'bg-sky-950/55',
  prizeTextGuaranteed: 'text-sky-200',
  prizeBorderGuaranteed: 'border-sky-500',
  prizeBorderCurrent: 'border-sky-200',
  prizeBorderPassed: 'border-sky-900',
  prizeGlowCurrent: 'rgba(0, 170, 255, 0.48)',

  glow: 'rgba(0, 170, 255, 0.42)',
  glowColor: '#00AAFF',
  glowSecondary: '#38bdf8',
  campaignCardGlow: 'rgba(0, 170, 255, 0.5)',
  campaignCardGlowColor: '#00AAFF',
  campaignCardGlowSecondary: '#38bdf8',
  campaignCardSurfaceClass:
    'bg-gradient-to-b from-sky-800/66 via-sky-900/38 to-slate-950/92',
  campaignCardFrameClass: 'border-sky-950/45',
  campaignCardLabelClass: 'text-slate-200/85',
  campaignCardIdleBorderColor: '#123e55',

  borderImageGradientDirection: '180deg',
  borderImageColors: 'rgba(255, 183, 77, 0.95), #ff7a18, #7c2d12',
};
