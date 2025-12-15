import type { GameRegistryMeta } from '../../engine/types';

export const gameRegistry: GameRegistryMeta = {
  registryVisible: true,
  order: 40,
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
};

export default gameRegistry;
