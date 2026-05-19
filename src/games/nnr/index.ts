import type { GameModule } from '@engine/types';
import { manifest } from './manifest';

export const gameModule = {
  id: manifest.id,
  info: manifest,
  loadConfig: async () => (await import('./config')).default,
} satisfies GameModule;

export default gameModule;
export { strings } from './strings';
