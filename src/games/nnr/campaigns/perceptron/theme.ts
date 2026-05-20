import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: false,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #020912 0%,' +
    ' #08243a 34%,' +
    ' #0d3f63 66%,' +
    ' #02070d 100%' +
    ')',

  textPrimary: 'text-sky-50',
  textSecondary: 'text-sky-100',
  textMuted: 'text-slate-300',
  textAccent: 'text-white',

  textTitle: 'text-white',
  textHeader: 'text-white',
  headerTextShadow:
    '0 6px 18px rgba(0, 0, 0, 0.52), 0 0 18px rgba(56, 189, 248, 0.42)',
  panelHeaderTextShadow: '0 2px 6px rgba(0, 0, 0, 0.65)',

  border: 'border-sky-200',
  borderLight: 'border-white',
  borderHover: 'hover:border-white',

  panelGradientDirection: '180deg',
  bgPanelFrom: 'rgba(7, 89, 133, 0.9)',
  bgPanelVia: 'rgba(14, 165, 233, 0.58)',
  bgPanelTo: 'rgba(2, 18, 30, 0.96)',

  headerGradientClass: 'bg-gradient-to-r',
  bgHeader: 'from-sky-950 via-sky-700 to-sky-950',
  bgHeaderVia: '#38bdf8',
  headerBorderColor: '#e0f2fe',

  bgButton: 'from-sky-500 via-sky-700 to-sky-950',
  buttonBorder: 'border-white',
  buttonGlow: 'rgba(56, 189, 248, 0.52)',

  bgAnswer: 'from-sky-950/85 via-sky-800/58 to-sky-950/85',
  bgAnswerHover:
    'hover:from-sky-900/95 hover:via-sky-700/72 hover:to-sky-950/95',
  shadowAnswer: 'hover:shadow-sky-300/35',

  bgLifeline: 'from-sky-700 to-sky-900',
  textLifeline: 'text-sky-50',
  borderLifeline: 'border-sky-400',

  bgPrizeCurrent: 'bg-white',
  bgPrizePassed: 'bg-sky-950/40',
  prizeTextCurrent: 'text-sky-950',
  prizeTextPassed: 'text-slate-300',
  prizeTextFuture: 'text-sky-100',
  prizeBgGuaranteed: 'bg-sky-950/55',
  prizeTextGuaranteed: 'text-sky-100',
  prizeBorderGuaranteed: 'border-sky-300',
  prizeBorderCurrent: 'border-white',
  prizeBorderPassed: 'border-sky-800',
  prizeGlowCurrent: 'rgba(224, 242, 254, 0.46)',

  glow: 'rgba(56, 189, 248, 0.42)',
  glowColor: '#38bdf8',
  glowSecondary: '#e0f2fe',
  campaignCardGlow: 'rgba(224, 242, 254, 0.44)',
  campaignCardGlowColor: '#e0f2fe',
  campaignCardGlowSecondary: '#38bdf8',
  campaignCardSurfaceClass:
    'bg-gradient-to-b from-sky-800/66 via-sky-900/38 to-slate-950/92',
  campaignCardFrameClass: 'border-sky-950/45',
  campaignCardLabelClass: 'text-slate-200/85',
  campaignCardIdleBorderColor: '#456879',

  borderImageGradientDirection: '180deg',
  borderImageColors: 'rgba(224, 242, 254, 0.95), #7dd3fc, #075985',
};
