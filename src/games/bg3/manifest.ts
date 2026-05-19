/**
 * @file Game metadata for Game Manifest.
 */
import type { BaseTheme, GameManifest } from '@engine/types';

export const manifest = {
  id: 'bg3',
  visible: true,
  available: true,
  title: "BALDUR'S GATE III",
  emoji: '⚔️',
  theme: {
    isLight: false,
    bgFrom: '#000000',
    bgVia: '#3b2416',
    bgTo: '#000000',
    glow: '#fbbf24',
  } satisfies BaseTheme,
} satisfies GameManifest;
