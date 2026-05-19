/**
 * @file Game metadata for Game Manifest.
 */
import type { BaseTheme, GameManifest } from '@engine/types';

export const manifest = {
  id: 'transformers',
  visible: true,
  available: true,
  title: 'TRANSFORMERS',
  emoji: '🤖',
  theme: {
    isLight: false,
    bgFrom: '#09090b',
    bgVia: '#09090b',
    bgTo: '#000000',
    glow: '#dc2626',
  } satisfies BaseTheme,
} satisfies GameManifest;
