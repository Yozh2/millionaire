/**
 * @file Game metadata for Game Manifest.
 */
import type { BaseTheme, GameManifest } from '@engine/types';

export const manifest = {
  id: 'poc',
  visible: true,
  available: true,
  title: 'PROOF OF CONCEPT',
  emoji: '⚙️',
  theme: {
    isLight: false,
    bgFrom: '#000000',
    bgVia: '#4338ca',
    bgTo: '#000000',
    glow: '#6366f1',
  } satisfies BaseTheme,
} satisfies GameManifest;
