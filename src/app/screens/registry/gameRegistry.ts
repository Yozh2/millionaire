import type { GameConfig, GameRegistryMeta } from '@engine/types';

export interface GameRegistryEntry {
  kind: 'game';
  id: string;
  routePath: string;
  visible: boolean;
  title: string;
  emoji: string;
  available: boolean;
  devOnly?: boolean;
  theme?: GameRegistryMeta['theme'];
  favicon?: GameRegistryMeta['favicon'];
  getConfig: () => Promise<GameConfig>;
}

type GameConfigModule = { default: GameConfig };
type GameRegistryModule = {
  registry: GameRegistryMeta;
};

const GAME_CONFIG_MODULES = import.meta.glob('../../../games/*/config.ts') as Record<
  string,
  () => Promise<GameConfigModule>
>;

const GAME_REGISTRY_MODULES = import.meta.glob('../../../games/*/registry.ts', {
  eager: true,
}) as Record<string, GameRegistryModule>;

const extractGameIdFromPath = (path: string): string | null => {
  const match = path.match(/\/games\/([^/]+)\/(config|registry)\.ts$/);
  return match?.[1] ?? null;
};

const buildGameEntries = (): GameRegistryEntry[] => {
  const entries: GameRegistryEntry[] = [];
  const configLoaders = new Map<string, () => Promise<GameConfig>>();

  for (const [path, loader] of Object.entries(GAME_CONFIG_MODULES)) {
    const id = extractGameIdFromPath(path);
    if (!id) continue;
    configLoaders.set(id, async () => (await loader()).default);
  }

  for (const [path, mod] of Object.entries(GAME_REGISTRY_MODULES)) {
    const meta = mod.registry;
    if (!meta) continue;

    const id = meta.id ?? extractGameIdFromPath(path);
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
      routePath: meta.routePath ?? `/${id}`,
      visible: meta.visible,
      title: meta.title,
      emoji: meta.emoji ?? '🎯',
      available: meta.available ?? true,
      devOnly: meta.devOnly,
      theme: meta.theme,
      favicon: meta.favicon,
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
