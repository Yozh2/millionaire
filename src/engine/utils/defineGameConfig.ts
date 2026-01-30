import { createDefaultAudioConfig } from '@engine/audio/defaultAudio';
import type {
  ActionConfig,
  ActionConfigInput,
  GameConfig,
  GameConfigInput,
  GameStringsNamespace,
  LifelineConfig,
  LifelineConfigInput,
  LifelineKind,
  LifelinesConfig,
  PrizesConfig,
} from '@engine/types';

const OPTIONAL_LIFELINE_FALLBACK_NAMES: Partial<Record<LifelineKind, string>> = {
  host: 'Host Help',
  switch: 'Switch Question',
  double: 'Second Chance',
};

const resolveLifeline = (
  gameId: string,
  kind: LifelineKind,
  input: LifelineConfigInput | undefined,
  strings: GameStringsNamespace,
  required: boolean
): LifelineConfig | undefined => {
  if (!input) {
    if (required) {
      throw new Error(`[${gameId}] Missing lifeline config for "${kind}".`);
    }
    return undefined;
  }

  const icon = input.icon;
  if (!icon) {
    throw new Error(`[${gameId}] Missing lifeline icon for "${kind}".`);
  }

  const nameFromStrings = strings.lifelines?.[kind];
  const name = input.name ?? nameFromStrings ?? OPTIONAL_LIFELINE_FALLBACK_NAMES[kind];
  if (!name) {
    throw new Error(`[${gameId}] Missing lifeline name for "${kind}".`);
  }

  return {
    name,
    icon,
    enabled: input.enabled ?? true,
  };
};

const resolveRetreatAction = (
  gameId: string,
  input: ActionConfigInput | undefined,
  strings: GameStringsNamespace
): ActionConfig => {
  if (!input) {
    throw new Error(`[${gameId}] Missing retreat action config.`);
  }
  const icon = input.icon;
  if (!icon) {
    throw new Error(`[${gameId}] Missing retreat action icon.`);
  }
  const name = input.name ?? strings.retreat;
  if (!name) {
    throw new Error(`[${gameId}] Missing retreat action name.`);
  }
  return {
    name,
    icon,
    enabled: input.enabled ?? true,
  };
};

export function defineGameConfig(raw: GameConfigInput): GameConfig {
  const strings = raw.strings;
  const title = raw.title ?? strings.headerTitle;
  const subtitle = raw.subtitle ?? strings.headerSubtitle;

  if (!title) {
    throw new Error(`[${raw.id}] Missing title (strings.headerTitle).`);
  }
  if (!subtitle) {
    throw new Error(`[${raw.id}] Missing subtitle (strings.headerSubtitle).`);
  }

  const companions = raw.companions ?? strings.companions ?? [];

  const lifelinesInput = raw.lifelines ?? {};
  const lifelines: LifelinesConfig = {
    fifty: resolveLifeline(raw.id, 'fifty', lifelinesInput.fifty, strings, true)!,
    phone: resolveLifeline(raw.id, 'phone', lifelinesInput.phone, strings, true)!,
    audience: resolveLifeline(
      raw.id,
      'audience',
      lifelinesInput.audience,
      strings,
      true
    )!,
    host: resolveLifeline(raw.id, 'host', lifelinesInput.host, strings, false),
    switch: resolveLifeline(raw.id, 'switch', lifelinesInput.switch, strings, false),
    double: resolveLifeline(raw.id, 'double', lifelinesInput.double, strings, false),
  };

  const actions = {
    retreat: resolveRetreatAction(raw.id, raw.actions?.retreat, strings),
  };

  const currency = raw.prizes.currency ?? strings.currency;
  if (!currency) {
    throw new Error(`[${raw.id}] Missing currency (strings.currency).`);
  }

  const prizes: PrizesConfig = {
    maxPrize: raw.prizes.maxPrize,
    guaranteedFractions: raw.prizes.guaranteedFractions,
    currency,
  };

  const audio = createDefaultAudioConfig(raw.audio);

  return {
    ...raw,
    title,
    subtitle,
    companions,
    lifelines,
    actions,
    prizes,
    audio,
  };
}
