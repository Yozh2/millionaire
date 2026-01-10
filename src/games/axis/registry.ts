/**
 * @file Game metadata for Game Registry.
 */
import type { BaseTheme, GameRegistry } from '@app/types';

export const registry = {
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
} satisfies GameRegistry;
