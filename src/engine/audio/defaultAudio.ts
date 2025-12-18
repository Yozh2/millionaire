import type { AudioConfig, SoundEffects } from '@engine/types';
import {
  DEFAULT_MUSIC_VOLUME,
  DEFAULT_SOUND_VOLUME,
  DEFAULT_VOICE_VOLUME,
} from '@engine/constants';

export const STANDARD_MUSIC_TRACKS = {
  mainMenuTrack: 'MainMenu.ogg',
  gameOverTrack: 'GameOver.ogg',
  victoryTrack: 'Victory.ogg',
  takeMoneyTrack: 'TookMoney.ogg',
} as const;

export const STANDARD_SOUND_EFFECTS: SoundEffects = {
  answerButton: 'AnswerClick.ogg',
  actionButton: 'BigButtonPress.ogg',

  lifelineFifty: 'HintReduce.ogg',
  lifelinePhone: 'HintCall.ogg',
  lifelineAudience: 'HintVote.ogg',
  lifelineDouble: 'DoubleDip.ogg',

  takeMoneyButton: 'HintTakeMoney.ogg',

  correct: 'Next.ogg',
  defeat: 'Fail.ogg',
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

