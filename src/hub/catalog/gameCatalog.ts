/**
 * Build the game catalog from lightweight manifests and lazy configs.
 * Hub may discover every game, but must not eagerly load full game modules.
 */
import type { GameConfig, GameManifest } from '@engine/types';
import { resolveGameFavicon } from '@engine/utils/paths';
import { GAME_CONFIG_LOADERS, MANIFEST_MODULES } from 'virtual:game-catalog';

export interface GameCatalogEntry {
  kind: 'game';
  id: string;
  routePath: string;
  visible: boolean;
  title: string;
  emoji: string;
  available: boolean;
  devOnly?: boolean;
  theme?: GameManifest['theme'];
  favicon?: GameManifest['favicon'];
  getConfig: () => Promise<GameConfig>;
}

const extractGameIdFromPath = (path: string): string | null => {
  const match = path.match(/\/games\/([^/]+)\/(config|manifest)\.ts$/);
  return match?.[1] ?? null;
};

const buildConfigLoaders = (): Map<string, () => Promise<GameConfig>> => {
  const configLoaders = new Map<string, () => Promise<GameConfig>>();

  for (const [path, loader] of Object.entries(GAME_CONFIG_LOADERS)) {
    const id = extractGameIdFromPath(path);
    if (!id) continue;
    configLoaders.set(id, async () => (await loader()).default);
  }

  return configLoaders;
};

const buildGameEntries = (): GameCatalogEntry[] => {
  const entries: GameCatalogEntry[] = [];
  const configLoaders = buildConfigLoaders();

  for (const [path, module] of Object.entries(MANIFEST_MODULES)) {
    const meta = module.manifest;
    const id = meta.id || extractGameIdFromPath(path);
    if (!id) continue;

    const configLoader = configLoaders.get(id);
    if (!configLoader) {
      if (import.meta.env.DEV) {
        console.warn(`[catalog] Missing config loader for game "${id}".`);
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

export const GAME_CATALOG: readonly GameCatalogEntry[] = buildGameEntries();

export const getCatalogEntries = (): GameCatalogEntry[] => GAME_CATALOG.slice();

export const getCatalogEntryById = (id: string): GameCatalogEntry | undefined =>
  GAME_CATALOG.find((entry) => entry.id === id);

/**
 * Entries to show in the main selector UI.
 * Includes non-available games as "coming soon", excludes dev-only entries.
 */
export const getVisibleCatalogEntries = (): GameCatalogEntry[] =>
  getCatalogEntries().filter((entry) => entry.visible && !entry.devOnly);
