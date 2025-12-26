import type { GameRegistryMeta } from '@engine/types';
import { gameFaviconFile } from '@public';
import { theme as heroTheme } from './campaigns/hero/theme';

export const id = 'bg3';
export const emoji = '⚔️';

export const registry: GameRegistryMeta = {
  registryVisible: true,
  order: 20,
  gameTitle: "BALDUR'S GATE III",
  available: true,
  loadingBgColor: '#3b2416',
  loadingTheme: {
    glowColor: heroTheme.glowColor,
    bgPanelFrom: heroTheme.bgPanelFrom,
    bgHeaderVia: heroTheme.bgHeaderVia,
  },
  faviconUrl: gameFaviconFile(id, 'favicon.svg'),
};
