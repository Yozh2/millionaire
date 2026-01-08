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
    isLight: true,
    bgFrom: '#f8fafc',
    bgVia: '#d1fae5',
    bgTo: '#e0f2fe',
    glow: '#38bdf8',
  } satisfies BaseTheme,
} satisfies GameRegistry;
