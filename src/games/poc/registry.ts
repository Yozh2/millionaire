import type { GameRegistryMeta } from '../../engine/types';

export const gameRegistry: GameRegistryMeta = {
  registryVisible: true,
  order: 10,
  card: {
    title: 'PROOF OF CONCEPT',
    subtitle: 'Тестовая игра',
    description: 'Минимальная демонстрация движка без внешних ассетов',
    emoji: '⚙️',
    gradient: 'from-slate-700 via-slate-600 to-slate-800',
    borderColor: 'border-slate-500',
    available: true,
  },
};

export default gameRegistry;
