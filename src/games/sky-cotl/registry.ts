/**
 * @file Game metadata for Game Registry.
 */
import type { BaseTheme, GameRegistry } from '@app/types';

export const registry = {
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
} satisfies GameRegistry;
