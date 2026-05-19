/**
 * @file Game metadata for Game Manifest.
 */
import type { BaseTheme, GameManifest } from '@engine/types';

export const manifest = {
  id: 'sky-cotl',
  visible: true,
  available: true,
  title: 'SKY',
  emoji: '☁️',
  theme: {
    isLight: true,
    bgFrom: '#ffffff',
    bgVia: '#00aaff',
    bgTo: '#ffffff',
    glow: '#fbbf24',
  } satisfies BaseTheme,
} satisfies GameManifest;
