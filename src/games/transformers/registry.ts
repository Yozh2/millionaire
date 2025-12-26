import type { GameRegistryMeta } from '@engine/types';
import { gameFaviconFile } from '@public';
import { theme as megatronTheme } from './campaigns/megatron/theme';

export const id = 'transformers';
export const emoji = '🤖';

export const registry: GameRegistryMeta = {
  registryVisible: true,
  order: 30,
  gameTitle: 'TRANSFORMERS',
  available: true,
  loadingBgColor: '#24313b',
  loadingTheme: {
    glowColor: megatronTheme.glowColor,
    bgPanelFrom: megatronTheme.bgPanelFrom,
    bgHeaderVia: megatronTheme.bgHeaderVia,
  },
  faviconUrl: gameFaviconFile(id, 'favicon.svg'),
};
