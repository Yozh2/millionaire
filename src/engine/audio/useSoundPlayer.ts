import { useCallback, useMemo, useRef } from 'react';
import type { Companion, GameConfig } from '@engine/types';
import {
  ensureAudioContext,
  warmUpAudioContext,
  isSoundEnabled,
  playSound,
  playSoundByType,
  playVoice,
  getPreloadedAudioSrc,
} from '@engine/utils/audioPlayer';
import { getAssetPaths } from '@engine/utils/assetLoader';
import type { OscillatorSoundKey } from '@engine/utils/audioPlayer';
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

  const taggedAudioRef = useRef<Record<TaggedSoundId, HTMLAudioElement | null>>({
    campaignSelect: null,
  });

  const requestIdRef = useRef<Record<TaggedSoundId, number>>({
    campaignSelect: 0,
  });

  const stopTaggedSound = useCallback((id: TaggedSoundId) => {
    requestIdRef.current[id] += 1;
    const audio = taggedAudioRef.current[id];
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.onended = null;
    audio.onerror = null;
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
        const paths = getAssetPaths('sounds', filename, config.id);
        const primarySrc = getPreloadedAudioSrc(paths.specific) || paths.specific;
        const fallbackSrc = getPreloadedAudioSrc(paths.fallback) || paths.fallback;

        const audioEl = taggedAudioRef.current[id] ?? new Audio();
        audioEl.preload = 'auto';
        audioEl.volume = config.audio.soundVolume;
        taggedAudioRef.current[id] = audioEl;

        let triedFallback = false;

        const cleanup = () => {
          audioEl.onended = null;
          audioEl.onerror = null;
        };

        audioEl.onended = cleanup;
        audioEl.onerror = () => {
          if (requestIdRef.current[id] !== requestId) return;

          if (!triedFallback && fallbackSrc && fallbackSrc !== audioEl.src) {
            triedFallback = true;
            audioEl.src = fallbackSrc;
            audioEl.currentTime = 0;
            void audioEl.play().catch(cleanup);
            return;
          }

          cleanup();
          playSoundEffect(taggedFallbackKey[id]);
        };

        const tryPlaySrc = async (src: string | null) => {
          if (!src) {
            cleanup();
            playSoundEffect(taggedFallbackKey[id]);
            return;
          }

          if (requestIdRef.current[id] !== requestId) return;

          if (audioEl.src !== src) {
            audioEl.src = src;
          }
          audioEl.currentTime = 0;

          try {
            await audioEl.play();
          } catch {
            if (!triedFallback && fallbackSrc && fallbackSrc !== src) {
              triedFallback = true;
              void tryPlaySrc(fallbackSrc);
              return;
            }
            cleanup();
            playSoundEffect(taggedFallbackKey[id]);
          }
        };

        await tryPlaySrc(primarySrc);
      };

      void loadAndPlay();
    },
    [
      config.audio.soundVolume,
      config.id,
      playSoundEffect,
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
