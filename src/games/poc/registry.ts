/**
 * @file Game metadata for Game Registry.
 */
import type { BaseTheme, GameRegistry } from '@app/types';

export const registry = {
  id: 'poc',
  visible: true,
  available: true,
  title: 'PROOF OF CONCEPT',
  emoji: '⚙️',
  theme: {
    bgFrom: '#000000',
    bgVia: '#4338ca',
    bgTo: '#000000',
    glow: '#6366f1',
  } satisfies BaseTheme,
} satisfies GameRegistry;
