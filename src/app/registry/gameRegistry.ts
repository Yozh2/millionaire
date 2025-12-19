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

const GAME_CONFIG_MODULES = import.meta.glob('../../games/*/config.ts', {
  eager: true,
}) as Record<string, GameConfigModule>;

const extractGameIdFromPath = (path: string): string | null => {
  const match = path.match(/\/games\/([^/]+)\/config\.ts$/);
  return match?.[1] ?? null;
};

const buildGameEntries = (): GameRegistryEntry[] => {
  const entries: GameRegistryEntry[] = [];

  for (const [path, mod] of Object.entries(GAME_CONFIG_MODULES)) {
    const id = extractGameIdFromPath(path);
    if (!id) continue;

    const config = mod.default;
    const meta: GameRegistryMeta | undefined = config.registry;
    if (!meta) continue;

    entries.push({
      kind: 'game',
      id,
      routePath: meta.routePath ?? `/${id}`,
      registryVisible: meta.registryVisible,
      order: meta.order,
      gameTitle: meta.gameTitle,
      emoji: config.emoji ?? '🎯',
      available: meta.available ?? true,
      devOnly: meta.devOnly,
      getConfig: async () => config,
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
