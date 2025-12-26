import type { ComponentType } from 'react';
import type { GameConfig, GameRegistryMeta } from '@engine/types';

export interface GameRegistryEntry {
  kind: 'game';
  id: string;
  routePath: string;
  registryVisible: boolean;
  order?: number;
  gameTitle: string;
  emoji: string;
  available: boolean;
  devOnly?: boolean;
  loadingTheme?: GameRegistryMeta['loadingTheme'];
  loadingBgColor?: GameRegistryMeta['loadingBgColor'];
  faviconUrl?: GameRegistryMeta['faviconUrl'];
  getConfig: () => Promise<GameConfig>;
}

export interface PageRegistryEntry {
  kind: 'page';
  id: string;
  routePath: string;
  devOnly?: boolean;
  getComponent: () => Promise<{ default: ComponentType }>;
}

export type RegistryEntry = GameRegistryEntry | PageRegistryEntry;

type GameConfigModule = { default: GameConfig };
type GameRegistryModule = {
  id: string;
  emoji?: string;
  registry: GameRegistryMeta;
};

const GAME_CONFIG_MODULES = import.meta.glob('../../games/*/config.ts') as Record<
  string,
  () => Promise<GameConfigModule>
>;

const GAME_REGISTRY_MODULES = import.meta.glob('../../games/*/registry.ts', {
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
    const id = mod.id ?? extractGameIdFromPath(path);
    if (!id) continue;

    const meta = mod.registry;
    if (!meta) continue;

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
      registryVisible: meta.registryVisible,
      order: meta.order,
      gameTitle: meta.gameTitle,
      emoji: mod.emoji ?? '🎯',
      available: meta.available ?? true,
      devOnly: meta.devOnly,
      loadingTheme: meta.loadingTheme,
      loadingBgColor: meta.loadingBgColor,
      faviconUrl: meta.faviconUrl,
      getConfig: configLoader,
    });
  }

  return entries.sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });
};

const PAGE_REGISTRY: readonly PageRegistryEntry[] = [
  {
    kind: 'page',
    id: 'effects-sandbox',
    routePath: '/sandbox',
    devOnly: true,
    getComponent: () => import('../../pages/EffectsSandboxPage'),
  },
  {
    kind: 'page',
    id: 'slideshow-sandbox',
    routePath: '/slideshow',
    devOnly: true,
    getComponent: () => import('../../pages/SandboxPage'),
  },
  {
    kind: 'page',
    id: 'loading-sandbox',
    routePath: '/loading-sandbox',
    devOnly: true,
    getComponent: () => import('../../pages/LoadingSandboxPage'),
  },
] as const;

export const GAME_REGISTRY: readonly RegistryEntry[] = [
  ...buildGameEntries(),
  ...PAGE_REGISTRY,
];

export const getGameEntries = (): GameRegistryEntry[] =>
  GAME_REGISTRY.filter((entry): entry is GameRegistryEntry => entry.kind === 'game');

export const getPageEntries = (): PageRegistryEntry[] =>
  GAME_REGISTRY.filter((entry): entry is PageRegistryEntry => entry.kind === 'page');

export const getGameById = (id: string): GameRegistryEntry | undefined =>
  getGameEntries().find((entry) => entry.id === id);

/**
 * Entries to show in the main selector UI.
 * Includes non-available games as "coming soon", excludes dev-only entries.
 */
export const getSelectorEntries = (): GameRegistryEntry[] =>
  getGameEntries().filter((entry) => entry.registryVisible && !entry.devOnly);
