import type { AudioConfig, SoundEffects } from '@engine/types';
import {
  DEFAULT_MUSIC_VOLUME,
  DEFAULT_SOUND_VOLUME,
  DEFAULT_VOICE_VOLUME,
} from '@engine/constants';

export const STANDARD_MUSIC_TRACKS = {
  menuTrack: 'menu.ogg',
  defeatTrack: 'defeat.ogg',
  victoryTrack: 'victory.ogg',
  moneyTrack: 'money.ogg',
} as const;

export const STANDARD_SOUND_EFFECTS: SoundEffects = {
  answerButton: 'answer-click.ogg',
  actionButton: 'action-press.ogg',

  lifelineFifty: 'lifeline-fifty.ogg',
  lifelinePhone: 'lifeline-phone.ogg',
  lifelineAudience: 'lifeline-audience.ogg',
  lifelineDouble: 'lifeline-double.ogg',

  takeMoneyButton: 'money.ogg',

  victory: 'victory.ogg',
  correct: 'correct.ogg',
  defeat: 'defeat.ogg',
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
