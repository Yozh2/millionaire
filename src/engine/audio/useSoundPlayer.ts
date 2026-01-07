import { useCallback, useMemo, useRef } from 'react';
import type { Companion, GameConfig } from '@engine/types';
import {
  ensureAudioContext,
  warmUpAudioContext,
  isSoundEnabled,
  playSound,
  playSoundWithHandle,
  playSoundByType,
  playVoice,
} from '@engine/utils/audioPlayer';
import type { AudioPlaybackHandle, OscillatorSoundKey } from '@engine/utils/audioPlayer';
import { resolveCompanionVoiceFilename } from './resolveCompanionVoice';

export type TaggedSoundId = 'campaignSelect';

export interface UseSoundPlayerReturn {
  playSoundEffect: (key: keyof GameConfig['audio']['sounds']) => void;
  playSoundFile: (filename: string) => void;
  playTaggedSound: (id: TaggedSoundId, filename: string) => void;
  stopTaggedSound: (id: TaggedSoundId) => void;
  playCompanionVoiceFile: (voiceFile: string) => Promise<boolean>;
  playCompanionVoice: (companion: Companion) => Promise<boolean>;
}

export function useSoundPlayer(config: GameConfig): UseSoundPlayerReturn {
  const hasWarmedContext = useRef(false);

  const taggedPlaybackRef = useRef<Record<TaggedSoundId, AudioPlaybackHandle | null>>({
    campaignSelect: null,
  });

  const requestIdRef = useRef<Record<TaggedSoundId, number>>({
    campaignSelect: 0,
  });

  const stopTaggedSound = useCallback((id: TaggedSoundId) => {
    requestIdRef.current[id] += 1;
    const handle = taggedPlaybackRef.current[id];
    if (!handle) return;
    handle.stop();
    taggedPlaybackRef.current[id] = null;
  }, []);

  const warmUpIfNeeded = useCallback(() => {
    if (hasWarmedContext.current) return;
    ensureAudioContext();
    warmUpAudioContext();
    hasWarmedContext.current = true;
  }, []);

  const playSoundEffect = useCallback(
    (key: keyof GameConfig['audio']['sounds']) => {
      if (!isSoundEnabled()) return;

      warmUpIfNeeded();

      const soundFile = config.audio.sounds[key];
      if (soundFile) {
        playSound(soundFile, config.audio.soundVolume);
        return;
      }

      playSoundByType(key as OscillatorSoundKey);
    },
    [config.audio.sounds, config.audio.soundVolume, warmUpIfNeeded]
  );

  const playSoundFile = useCallback(
    (filename: string) => {
      if (!isSoundEnabled()) return;
      warmUpIfNeeded();
      playSound(filename, config.audio.soundVolume);
    },
    [config.audio.soundVolume, warmUpIfNeeded]
  );

  const taggedFallbackKey = useMemo<
    Record<TaggedSoundId, keyof GameConfig['audio']['sounds']>
  >(
    () => ({
      campaignSelect: 'answerButton',
    }),
    []
  );

  const playTaggedSound = useCallback(
    (id: TaggedSoundId, filename: string) => {
      if (!filename) return;

      stopTaggedSound(id);
      const requestId = ++requestIdRef.current[id];

      if (!isSoundEnabled()) return;

      warmUpIfNeeded();

      const loadAndPlay = async () => {
        const handle = await playSoundWithHandle(
          filename,
          config.audio.soundVolume
        );

        if (requestIdRef.current[id] !== requestId) {
          handle?.stop();
          return;
        }

        if (handle) {
          taggedPlaybackRef.current[id] = handle;
          return;
        }

        playSoundEffect(taggedFallbackKey[id]);
      };

      void loadAndPlay();
    },
    [
      config.audio.soundVolume,
      playSoundEffect,
      playSoundWithHandle,
      stopTaggedSound,
      taggedFallbackKey,
      warmUpIfNeeded,
    ]
  );

  const playCompanionVoiceFile = useCallback(
    async (voiceFile: string): Promise<boolean> => {
      if (!isSoundEnabled()) return false;
      warmUpIfNeeded();
      return playVoice(voiceFile, config.audio.voiceVolume);
    },
    [config.audio.voiceVolume, warmUpIfNeeded]
  );

  const playCompanionVoice = useCallback(
    async (companion: Companion): Promise<boolean> => {
      const explicit = companion.voiceFile;
      if (explicit) return playCompanionVoiceFile(explicit);

      const resolved = await resolveCompanionVoiceFilename(config.id, companion);
      if (!resolved) return false;
      return playCompanionVoiceFile(resolved);
    },
    [config.id, playCompanionVoiceFile]
  );

  return {
    playSoundEffect,
    playSoundFile,
    playTaggedSound,
    stopTaggedSound,
    playCompanionVoiceFile,
    playCompanionVoice,
  };
}

export default useSoundPlayer;
