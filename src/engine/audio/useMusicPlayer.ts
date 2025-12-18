import { useCallback, useEffect, useRef, useState } from 'react';
import type { Campaign, GameConfig } from '@engine/types';
import { logger } from '../services';
import {
  ensureAudioContext,
  warmUpAudioContext,
  setSoundEnabled as setEngineSoundEnabled,
} from '../utils/audioPlayer';
import { getAssetPaths, checkFileExists } from '../utils/assetLoader';
import { STORAGE_KEY_SOUND_ENABLED } from '../constants';
import { getPreloadedAudioSrc } from '../utils/audioPlayer';

export interface UseMusicPlayerReturn {
  isMusicPlaying: boolean;
  currentTrack: string;
  toggleMusic: () => void;
  switchMusicTrack: (trackFile: string | undefined, autoPlay?: boolean) => void;
  playMainMenu: () => void;
  playGameOver: () => void;
  playVictory: () => void;
  playTakeMoney: () => void;
  playEndMusic: (state: 'won' | 'lost' | 'took_money') => void;
  playCampaignMusic: (campaign: Campaign) => void;
  stopMusic: () => void;
}

interface UseMusicPlayerOptions {
  audioElementId?: string;
  onDisableAllSounds?: () => void;
}

const getSavedSoundPreference = (): boolean | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SOUND_ENABLED);
    if (saved === null) return null;
    return saved === 'true';
  } catch {
    return null;
  }
};

const saveSoundPreference = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SOUND_ENABLED, String(enabled));
  } catch {
    // Ignore storage errors
  }
};

export function useMusicPlayer(
  config: GameConfig,
  { audioElementId = 'bg-music', onDisableAllSounds }: UseMusicPlayerOptions = {}
): UseMusicPlayerReturn {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');

  const musicEverEnabled = useRef(false);
  const userDisabledMusic = useRef(false);
  const hasTriedRestore = useRef(false);

  const getAudioElement = useCallback((): HTMLAudioElement | null => {
    return document.getElementById(audioElementId) as HTMLAudioElement | null;
  }, [audioElementId]);

  const setAudioSource = useCallback((audio: HTMLAudioElement, logicalPath: string) => {
    const cachedSrc = getPreloadedAudioSrc(logicalPath);
    audio.src = cachedSrc ?? logicalPath;
    audio.dataset.logicalSrc = logicalPath;
  }, []);

  const primeAudio = useCallback((audio: HTMLAudioElement) => {
    try {
      audio.load();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const savedPreference = getSavedSoundPreference();
    if (savedPreference === true) {
      musicEverEnabled.current = true;
      userDisabledMusic.current = false;
      setEngineSoundEnabled(true);
      setIsMusicPlaying(true);
    }
  }, []);

  useEffect(() => {
    const loadInitialTrack = async () => {
      if (!config.audio.mainMenuTrack) return;

      const paths = getAssetPaths('music', config.audio.mainMenuTrack, config.id);

      if (
        getPreloadedAudioSrc(paths.specific) ||
        (await checkFileExists(paths.specific))
      ) {
        setCurrentTrack(paths.specific);
        return;
      }

      if (
        getPreloadedAudioSrc(paths.fallback) ||
        (await checkFileExists(paths.fallback))
      ) {
        setCurrentTrack(paths.fallback);
      }
    };

    void loadInitialTrack();
  }, [config.id, config.audio.mainMenuTrack]);

  useEffect(() => {
    const savedPreference = getSavedSoundPreference();
    if (savedPreference !== true) return;
    if (!currentTrack) return;

    const tryPlayMusic = () => {
      if (hasTriedRestore.current) return;
      hasTriedRestore.current = true;

      const audio = document.getElementById(audioElementId) as HTMLAudioElement;
      if (audio) {
        setAudioSource(audio, currentTrack);
        audio.volume = config.audio.musicVolume;
        audio.play().catch((err) => {
          logger.audioPlayer.warn('Auto-play failed on interaction', { error: err });
        });
      }

      document.removeEventListener('click', tryPlayMusic);
      document.removeEventListener('keydown', tryPlayMusic);
      document.removeEventListener('touchstart', tryPlayMusic);
    };

    document.addEventListener('click', tryPlayMusic);
    document.addEventListener('keydown', tryPlayMusic);
    document.addEventListener('touchstart', tryPlayMusic);

    return () => {
      document.removeEventListener('click', tryPlayMusic);
      document.removeEventListener('keydown', tryPlayMusic);
      document.removeEventListener('touchstart', tryPlayMusic);
    };
  }, [audioElementId, config.audio.musicVolume, currentTrack, setAudioSource]);

  const loadTrack = useCallback(
    async (trackFile: string | undefined): Promise<string | null> => {
      if (!trackFile) return null;

      const paths = getAssetPaths('music', trackFile, config.id);

      if (getPreloadedAudioSrc(paths.specific)) return paths.specific;
      if (await checkFileExists(paths.specific)) return paths.specific;

      if (getPreloadedAudioSrc(paths.fallback)) return paths.fallback;
      if (await checkFileExists(paths.fallback)) return paths.fallback;

      return null;
    },
    [config.id]
  );

  const switchMusicTrack = useCallback(
    async (trackFile: string | undefined, autoPlay: boolean = false) => {
      const audio = getAudioElement();
      if (!audio) return;

      const trackPath = await loadTrack(trackFile);

      if (!trackPath) {
        audio.pause();
        audio.src = '';
        audio.dataset.logicalSrc = '';
        setCurrentTrack('');
        return;
      }

      const currentLogicalSrc = audio.dataset.logicalSrc || audio.src;
      const currentFileName = currentLogicalSrc.split('/').pop();
      const newFileName = trackPath.split('/').pop();

      if (currentFileName === newFileName && !audio.paused) return;

      setAudioSource(audio, trackPath);
      audio.volume = config.audio.musicVolume;
      setCurrentTrack(trackPath);
      primeAudio(audio);

      const shouldPlay =
        !userDisabledMusic.current && (autoPlay || musicEverEnabled.current);

      if (!shouldPlay) return;

      if (autoPlay) {
        musicEverEnabled.current = true;
        setEngineSoundEnabled(true);
        saveSoundPreference(true);
      }

      const tryPlay = () => {
        audio.play().catch((err) => {
          logger.audioPlayer.warn('Music play failed', { error: err });
        });
      };

      ensureAudioContext();
      warmUpAudioContext();

      if (audio.readyState >= 2) {
        tryPlay();
      } else {
        audio.addEventListener('canplay', tryPlay, { once: true });
      }
    },
    [config.audio.musicVolume, getAudioElement, loadTrack, primeAudio, setAudioSource]
  );

  const toggleMusic = useCallback(() => {
    const audio = getAudioElement();
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
      userDisabledMusic.current = true;
      setEngineSoundEnabled(false);
      saveSoundPreference(false);
      onDisableAllSounds?.();
      return;
    }

    userDisabledMusic.current = false;
    musicEverEnabled.current = true;
    setEngineSoundEnabled(true);
    saveSoundPreference(true);

    ensureAudioContext();
    warmUpAudioContext();

    if (currentTrack) {
      setAudioSource(audio, currentTrack);
      audio.volume = config.audio.musicVolume;
      audio.play().catch(() => {
        setIsMusicPlaying(true);
      });
      setIsMusicPlaying(true);
    } else {
      setIsMusicPlaying(true);
    }
  }, [
    config.audio.musicVolume,
    currentTrack,
    getAudioElement,
    isMusicPlaying,
    onDisableAllSounds,
    setAudioSource,
  ]);

  const playMainMenu = useCallback(() => {
    const shouldAutoPlay = musicEverEnabled.current && !userDisabledMusic.current;
    void switchMusicTrack(config.audio.mainMenuTrack, shouldAutoPlay);
  }, [config.audio.mainMenuTrack, switchMusicTrack]);

  const tryPlayTrackWithFallback = useCallback(
    async (trackFiles: (string | undefined)[], autoPlay: boolean = false): Promise<boolean> => {
      for (const trackFile of trackFiles) {
        if (!trackFile) continue;
        const trackPath = await loadTrack(trackFile);
        if (trackPath) {
          await switchMusicTrack(trackFile, autoPlay);
          return true;
        }
      }
      return false;
    },
    [loadTrack, switchMusicTrack]
  );

  const playGameOver = useCallback(() => {
    void tryPlayTrackWithFallback([config.audio.gameOverTrack], true);
  }, [config.audio.gameOverTrack, tryPlayTrackWithFallback]);

  const playVictory = useCallback(() => {
    void tryPlayTrackWithFallback(
      [config.audio.victoryTrack, config.audio.gameOverTrack],
      true
    );
  }, [config.audio.gameOverTrack, config.audio.victoryTrack, tryPlayTrackWithFallback]);

  const playTakeMoney = useCallback(() => {
    void tryPlayTrackWithFallback(
      [config.audio.takeMoneyTrack, config.audio.victoryTrack, config.audio.gameOverTrack],
      true
    );
  }, [
    config.audio.gameOverTrack,
    config.audio.takeMoneyTrack,
    config.audio.victoryTrack,
    tryPlayTrackWithFallback,
  ]);

  const playEndMusic = useCallback(
    (state: 'won' | 'lost' | 'took_money') => {
      if (state === 'won') {
        playVictory();
        return;
      }
      if (state === 'took_money') {
        playTakeMoney();
        return;
      }
      playGameOver();
    },
    [playGameOver, playTakeMoney, playVictory]
  );

  const playCampaignMusic = useCallback(
    (campaign: Campaign) => {
      void switchMusicTrack(campaign.musicTrack, true);
    },
    [switchMusicTrack]
  );

  const stopMusic = useCallback(() => {
    const audio = getAudioElement();
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsMusicPlaying(false);
  }, [getAudioElement]);

  return {
    isMusicPlaying,
    currentTrack,
    toggleMusic,
    switchMusicTrack: (trackFile, autoPlay) => {
      void switchMusicTrack(trackFile, !!autoPlay);
    },
    playMainMenu,
    playGameOver,
    playVictory,
    playTakeMoney,
    playEndMusic,
    playCampaignMusic,
    stopMusic,
  };
}

export default useMusicPlayer;
