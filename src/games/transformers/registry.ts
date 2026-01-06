/**
 * @file Game metadata for Game Registry.
 */
import type { BaseTheme, GameRegistry } from '@app/types';

export const registry = {
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
} satisfies GameRegistry;
