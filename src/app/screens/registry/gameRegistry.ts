/**
 * Build the game registry from eager registry.ts and lazy config.ts modules.
 * Used by the selector UI and registered routes.
 */
import type { GameRegistry } from '@app/types';
import {
  GAME_CONFIG_MODULES,
  extractGameIdFromPath,
  resolveGameFavicon,
} from '@app/utils/paths';
import { GAME_REGISTRY_INDEX } from './registryIndex';

export interface GameRegistryEntry {
  kind: 'game';
  id: string;
  routePath: string;
  visible: boolean;
  title: string;
  emoji: string;
  available: boolean;
  devOnly?: boolean;
  theme?: GameRegistry['theme'];
  favicon?: GameRegistry['favicon'];
  getConfig: () => Promise<unknown>;
}

const buildGameEntries = (): GameRegistryEntry[] => {
  const entries: GameRegistryEntry[] = [];
  const configLoaders = new Map<string, () => Promise<unknown>>();

  for (const [path, loader] of Object.entries(GAME_CONFIG_MODULES)) {
    const id = extractGameIdFromPath(path);
    if (!id) continue;
    configLoaders.set(id, async () => (await loader()).default);
  }

  for (const meta of GAME_REGISTRY_INDEX) {
    const id = meta.id;
    if (!id) continue;

    const configLoader = configLoaders.get(id);
    if (!configLoader) {
      if (import.meta.env.DEV) {
        console.warn(`[registry] Missing config loader for game "${id}".`);
      }
      continue;
    }

    entries.push({
      kind: 'game',
      id,
      routePath: meta.route ?? `/${id}`,
      visible: meta.visible,
      title: meta.title,
      emoji: meta.emoji ?? '🎯',
      available: meta.available ?? true,
      devOnly: meta.devonly,
      theme: meta.theme,
      favicon: resolveGameFavicon(id, meta.favicon),
      getConfig: configLoader,
    });
  }

  return entries.sort((a, b) => {
    const titleCompare = a.title.localeCompare(b.title);
    if (titleCompare !== 0) return titleCompare;
    return a.id.localeCompare(b.id);
  });
};

export const GAME_REGISTRY: readonly GameRegistryEntry[] = buildGameEntries();

export const getGameEntries = (): GameRegistryEntry[] => GAME_REGISTRY.slice();

export const getGameById = (id: string): GameRegistryEntry | undefined =>
  GAME_REGISTRY.find((entry) => entry.id === id);

/**
 * Entries to show in the main selector UI.
 * Includes non-available games as "coming soon", excludes dev-only entries.
 */
export const getSelectorEntries = (): GameRegistryEntry[] =>
  getGameEntries().filter((entry) => entry.visible && !entry.devOnly);
