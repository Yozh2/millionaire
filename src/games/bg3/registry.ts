/**
 * @file Game metadata for Game Registry.
 */
import type { BaseTheme, GameRegistry } from '@app/types';

export const registry = {
  id: 'bg3',
  visible: true,
  available: true,
  title: "BALDUR'S GATE III",
  emoji: '⚔️',
  theme: {
    bgFrom: '#000000',
    bgVia: '#3b2416',
    bgTo: '#000000',
    glow: '#fbbf24',
  } satisfies BaseTheme,
} satisfies GameRegistry;
