/**
 * @file Game metadata for Game Registry.
 */
import type { BaseTheme, GameRegistry } from '@app/types';

export const registry = {
  id: 'nnr',
  visible: true,
  available: true,
  title: 'НЕЙРОСЕТИ В РАДИОЛОКАЦИИ',
  emoji: '🧠',
  theme: {
    isLight: false,
    bgFrom: '#041815',
    bgVia: '#063647',
    bgTo: '#02060c',
    glow: '#63D792',
  } satisfies BaseTheme,
} satisfies GameRegistry;
