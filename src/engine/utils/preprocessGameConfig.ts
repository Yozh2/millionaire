import type { GameConfig } from '@engine/types';
import { applyNoBreakMarkupDeep } from './noBreakMarkup';

/**
 * Engine-level config preprocessing.
 *
 * Currently:
 * - applies `{no-break markup}` to `config.strings` and `config.systemStrings`.
 */
export function preprocessGameConfig(rawConfig: GameConfig): GameConfig {
  return {
    ...rawConfig,
    strings: applyNoBreakMarkupDeep(rawConfig.strings),
    systemStrings: rawConfig.systemStrings
      ? applyNoBreakMarkupDeep(rawConfig.systemStrings)
      : undefined,
  };
}

