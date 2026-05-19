/**
 * @file Game metadata for Game Manifest.
 */
import type { BaseTheme, GameManifest } from '@engine/types';

export const manifest = {
  id: 'axis',
  visible: true,
  available: true,
  title: 'AXIS',
  emoji: '🧭',
  theme: {
    isLight: false,
    bgFrom: '#020617',
    bgVia: '#0b1b34',
    bgTo: '#05070f',
    glow: '#38bdf8',
  } satisfies BaseTheme,
} satisfies GameManifest;
