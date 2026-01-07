import type { AudioConfig, SoundEffects } from '@engine/types';
import {
  DEFAULT_MUSIC_VOLUME,
  DEFAULT_SOUND_VOLUME,
  DEFAULT_VOICE_VOLUME,
} from '@engine/constants';

export const STANDARD_MUSIC_TRACKS = {
  menuTrack: 'menu.m4a',
  defeatTrack: 'defeat.m4a',
  victoryTrack: 'victory.m4a',
  retreatTrack: 'retreat.m4a',
} as const;

export const STANDARD_SOUND_EFFECTS: SoundEffects = {
  answerButton: 'answer-click.m4a',
  actionButton: 'action-press.m4a',

  lifelineFifty: 'lifeline-fifty.m4a',
  lifelinePhone: 'lifeline-phone.m4a',
  lifelineAudience: 'lifeline-audience.m4a',
  lifelineDouble: 'lifeline-double.m4a',

  retreatButton: 'retreat.m4a',

  victory: 'victory.m4a',
  correct: 'correct.m4a',
  defeat: 'defeat.m4a',
};

export const createDefaultAudioConfig = (
  overrides: Partial<AudioConfig> & { sounds?: SoundEffects } = {}
): AudioConfig => {
  const defaults: AudioConfig = {
    musicVolume: DEFAULT_MUSIC_VOLUME,
    soundVolume: DEFAULT_SOUND_VOLUME,
    voiceVolume: DEFAULT_VOICE_VOLUME,
    ...STANDARD_MUSIC_TRACKS,
    sounds: STANDARD_SOUND_EFFECTS,
  };

  return {
    ...defaults,
    ...overrides,
    sounds: {
      ...defaults.sounds,
      ...overrides.sounds,
    },
  };
};
