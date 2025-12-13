import type { ComponentType } from 'react';
import type { GameConfig } from '../../engine/types';

export interface GameCardMeta {
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  gradient: string;
  borderColor: string;
  available: boolean;
}

export interface GameRegistryEntry {
  kind: 'game';
  id: string;
  routePath: string;
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

export const GAME_REGISTRY: readonly RegistryEntry[] = [
  {
    kind: 'game',
    id: 'poc',
    routePath: '/poc',
    card: {
      title: 'PROOF OF CONCEPT',
      subtitle: 'Тестовая игра',
      description: 'Минимальная демонстрация движка без внешних ассетов',
      emoji: '⚙️',
      gradient: 'from-slate-700 via-slate-600 to-slate-800',
      borderColor: 'border-slate-500',
      available: true,
    },
    getConfig: async () => (await import('../../games/poc/config')).pocConfig,
  },
  {
    kind: 'game',
    id: 'bg3',
    routePath: '/bg3',
    card: {
      title: "BALDUR'S GATE 3",
      subtitle: 'Forgotten Realms Edition',
      description: "Викторина по вселенной Baldur's Gate 3",
      emoji: '⚔️',
      gradient: 'from-amber-700 via-amber-600 to-amber-800',
      borderColor: 'border-amber-500',
      available: true,
    },
    getConfig: async () => (await import('../../games/bg3/config')).bg3Config,
  },
  {
    kind: 'game',
    id: 'sky-cotl',
    routePath: '/sky-cotl',
    card: {
      title: 'SKY',
      subtitle: 'Children of the Light Edition',
      description:
        'A 15-question quiz about Sky: Children of the Light (English-only)',
      emoji: '☁️',
      gradient: 'from-sky-500 via-sky-400 to-emerald-500',
      borderColor: 'border-sky-300',
      available: true,
    },
    getConfig: async () =>
      (await import('../../games/sky-cotl/config')).skyCotlConfig,
  },
  {
    kind: 'game',
    id: 'transformers',
    routePath: '/transformers',
    card: {
      title: 'TRANSFORMERS',
      subtitle: 'COMICS EDITION',
      description: 'Викторина по комиксам про Трансформеров',
      emoji: '🤖',
      gradient: 'from-purple-700 via-red-600 to-purple-800',
      borderColor: 'border-purple-500',
      available: false,
    },
    getConfig: async () =>
      (await import('../../games/transformers/config')).transformersConfig,
  },
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
  getGameEntries().filter((entry) => !entry.devOnly);

