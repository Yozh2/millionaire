declare module 'virtual:root-shell' {
  import type { ComponentType } from 'react';

  export const RootShell: ComponentType;
}

declare module 'virtual:selected-game' {
  import type { GameModule } from '@engine/types';

  export const selectedGameId: string;
  export const loadSelectedGame: () => Promise<{ default: GameModule }>;
}

declare module 'virtual:game-catalog' {
  import type { GameConfig, GameManifest } from '@engine/types';

  export const MANIFEST_MODULES: Record<string, { manifest: GameManifest }>;
  export const GAME_CONFIG_LOADERS: Record<
    string,
    () => Promise<{ default: GameConfig }>
  >;
}
