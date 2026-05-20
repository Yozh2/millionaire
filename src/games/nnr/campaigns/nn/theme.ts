import type { ThemeColors } from '@engine/types';

export const theme: ThemeColors = {
  isLight: false,

  bgGradient:
    'linear-gradient(180deg,' +
    ' #020202 0%,' +
    ' #031016 32%,' +
    ' #071f27 64%,' +
    ' #000000 100%' +
    ')',

  textPrimary: 'text-cyan-50',
  textSecondary: 'text-cyan-100',
  textMuted: 'text-zinc-400',
  textAccent: 'text-yellow-200',

  textTitle: 'text-cyan-50',
  textHeader: 'text-cyan-50',
  headerTextShadow:
    '0 6px 18px rgba(0, 0, 0, 0.62), 0 0 18px rgba(34, 211, 238, 0.42)',
  panelHeaderTextShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',

  border: 'border-yellow-500',
  borderLight: 'border-cyan-300',
  borderHover: 'hover:border-yellow-300',

  panelGradientDirection: '180deg',
  bgPanelFrom: 'rgba(0, 0, 0, 0.96)',
  bgPanelVia: 'rgba(6, 58, 69, 0.72)',
  bgPanelTo: 'rgba(0, 0, 0, 0.98)',

  headerGradientClass: 'bg-gradient-to-r',
  bgHeader: 'from-black via-cyan-950 to-black',
  bgHeaderVia: '#06b6d4',
  headerBorderColor: '#facc15',

  bgButton: 'from-cyan-500 via-cyan-700 to-cyan-950',
  buttonBorder: 'border-yellow-300',
  buttonGlow: 'rgba(34, 211, 238, 0.5)',

  bgAnswer: 'from-black via-cyan-950/52 to-black',
  bgAnswerHover: 'hover:from-black hover:via-cyan-900/68 hover:to-black',
  shadowAnswer: 'hover:shadow-cyan-500/35',

  bgLifeline: 'from-cyan-800 to-black',
  textLifeline: 'text-cyan-50',
  borderLifeline: 'border-cyan-400',

  bgPrizeCurrent: 'bg-yellow-500',
  bgPrizePassed: 'bg-cyan-950',
  prizeTextCurrent: 'text-black',
  prizeTextPassed: 'text-cyan-200/70',
  prizeTextFuture: 'text-cyan-100',
  prizeBgGuaranteed: 'bg-cyan-950/70',
  prizeTextGuaranteed: 'text-yellow-500',
  prizeBorderGuaranteed: 'border-yellow-500',
  prizeBorderCurrent: 'border-yellow-500',
  prizeBorderPassed: 'border-cyan-950',
  prizeGlowCurrent: 'rgba(250, 204, 21, 0.42)',

  glow: 'rgba(34, 211, 238, 0.4)',
  glowColor: '#22d3ee',
  glowSecondary: '#facc15',
  campaignCardGlow: 'rgba(34, 211, 238, 0.5)',
  campaignCardGlowColor: '#22d3ee',
  campaignCardGlowSecondary: '#67e8f9',
  campaignCardSurfaceClass:
    'bg-gradient-to-b from-cyan-950/72 via-cyan-900/42 to-slate-950/90',
  campaignCardFrameClass: 'border-cyan-100/16',
  campaignCardLabelClass: 'text-zinc-300',
  campaignCardIdleBorderColor: '#0891b2',

  borderImageGradientDirection: '180deg',
  borderImageColors: 'rgba(250, 204, 21, 0.95), #ca8a04, #422006',
};
