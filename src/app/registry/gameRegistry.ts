import type { ComponentType } from 'react';
import type { GameConfig, GameRegistryCardMeta, GameRegistryMeta } from '../../engine/types';

export type GameCardMeta = GameRegistryCardMeta;

export interface GameRegistryEntry {
  kind: 'game';
  id: string;
  routePath: string;
  registryVisible: boolean;
  order?: number;
  card: GameCardMeta;
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

type GameRegistryModule = { gameRegistry?: GameRegistryMeta; default?: GameRegistryMeta };

const GAME_REGISTRY_MODULES = import.meta.glob('../../games/*/registry.ts', {
  eager: true,
}) as Record<string, GameRegistryModule>;

const GAME_CONFIG_IMPORTERS = import.meta.glob('../../games/*/config.ts') as Record<
  string,
  () => Promise<{ default: GameConfig }>
>;

const extractGameIdFromPath = (path: string): string | null => {
  const match = path.match(/\/games\/([^/]+)\/registry\.ts$/);
  return match?.[1] ?? null;
};

const buildGameEntries = (): GameRegistryEntry[] => {
  const entries: GameRegistryEntry[] = [];

  for (const [path, mod] of Object.entries(GAME_REGISTRY_MODULES)) {
    const id = extractGameIdFromPath(path);
    if (!id) continue;

    const meta = mod.gameRegistry ?? mod.default;
    if (!meta) continue;

    const configImporter = GAME_CONFIG_IMPORTERS[`../../games/${id}/config.ts`];
    if (!configImporter) {
      console.warn(`[registry] Missing config for game: ${id}`);
      continue;
    }

    entries.push({
      kind: 'game',
      id,
      routePath: meta.routePath ?? `/${id}`,
      registryVisible: meta.registryVisible,
      order: meta.order,
      card: meta.card,
      devOnly: meta.devOnly,
      getConfig: async () => (await configImporter()).default,
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
