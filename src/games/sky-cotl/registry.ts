import type { GameRegistryMeta } from '@engine/types';
import { gameFaviconFile } from '@public';
import { theme as mothTheme } from './campaigns/moth/theme';

export const id = 'sky-cotl';
export const emoji = '☁️';

export const registry: GameRegistryMeta = {
  registryVisible: true,
  order: 40,
  gameTitle: 'SKY',
  available: true,
  loadingBgColor: '#00AAFF',
  loadingTheme: {
    glowColor: mothTheme.glowColor,
    bgPanelFrom: mothTheme.bgPanelFrom,
    bgHeaderVia: mothTheme.bgHeaderVia,
  },
  faviconUrl: gameFaviconFile(id, 'favicon.svg'),
};
