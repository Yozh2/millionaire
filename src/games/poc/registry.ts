import type { GameRegistryMeta } from '@engine/types';
import { theme as easyTheme } from './campaigns/easy/theme';

export const id = 'poc';
export const emoji = '⚙️';

export const registry: GameRegistryMeta = {
  registryVisible: true,
  order: 10,
  gameTitle: 'PROOF OF CONCEPT',
  available: true,
  loadingTheme: {
    glowColor: easyTheme.glowColor,
    bgPanelFrom: easyTheme.bgPanelFrom,
    bgHeaderVia: easyTheme.bgHeaderVia,
  },
};
