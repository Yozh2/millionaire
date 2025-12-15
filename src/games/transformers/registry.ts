import type { GameRegistryMeta } from '../../engine/types';

export const gameRegistry: GameRegistryMeta = {
  registryVisible: true,
  order: 30,
  card: {
    title: 'TRANSFORMERS',
    subtitle: 'COMICS EDITION',
    description: 'Викторина по комиксам про Трансформеров',
    emoji: '🤖',
    gradient: 'from-purple-700 via-red-600 to-purple-800',
    borderColor: 'border-purple-500',
    available: true,
  },
};

export default gameRegistry;
