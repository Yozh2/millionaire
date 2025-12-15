import type { GameRegistryMeta } from '../../engine/types';

export const gameRegistry: GameRegistryMeta = {
  registryVisible: true,
  order: 20,
  card: {
    title: "BALDUR'S GATE III",
    subtitle: 'Edition',
    description: "Викторина по Baldur's Gate III",
    emoji: '⚔️',
    gradient: 'from-amber-700 via-amber-600 to-amber-800',
    borderColor: 'border-amber-500',
    available: true,
  },
};

export default gameRegistry;
