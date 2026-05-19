/**
 * @file Game metadata for Game Manifest.
 */
import type { BaseTheme, GameManifest } from '@engine/types';

export const manifest = {
  id: 'nnr',
  visible: true,
  available: true,
  title: 'КУРС NNR',
  emoji: '🧠',
  theme: {
    isLight: false,
    bgFrom: '#041815',
    bgVia: '#063647',
    bgTo: '#02060c',
    glow: '#63D792',
  } satisfies BaseTheme,
} satisfies GameManifest;
