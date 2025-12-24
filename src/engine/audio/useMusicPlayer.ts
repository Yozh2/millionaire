import { useCallback, useEffect, useRef, useState } from 'react';
import type { Campaign, GameConfig } from '@engine/types';
import { logger } from '../services';
import {
  ensureAudioContext,
  warmUpAudioContext,
  isSoundEnabled,
  setSoundEnabled as setEngineSoundEnabled,
} from '../utils/audioPlayer';
import { getAssetPaths, checkFileExists } from '../utils/assetLoader';
import { getPreloadedAudioSrc } from '../utils/audioPlayer';

export interface UseMusicPlayerReturn {
  isMusicPlaying: boolean;
  currentTrack: string;
  toggleMusic: () => void;
  switchMusicTrack: (trackFile: string | undefined, autoPlay?: boolean) => void;
  playMainMenu: () => void;
  playGameOver: () => void;
  playVictory: () => void;
  playRetreat: () => void;
  playEndMusic: (state: 'victory' | 'defeat' | 'retreat') => void;
  playCampaignMusic: (campaign: Campaign) => void;
  stopMusic: () => void;
}

interface UseMusicPlayerOptions {
  audioElementId?: string;
  onDisableAllSounds?: () => void;
}

export function useMusicPlayer(
  config: GameConfig,
  { audioElementId = 'bg-music', onDisableAllSounds }: UseMusicPlayerOptions = {}
): UseMusicPlayerReturn {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');

  const musicEverEnabled = useRef(false);
  const userDisabledMusic = useRef(false);

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
    const loadInitialTrack = async () => {
      const trackFile = config.audio.menuTrack ?? 'menu.ogg';
      const candidates = [trackFile, 'menu.ogg', 'MainMenu.ogg'];

      for (const candidate of candidates) {
        if (!candidate) continue;
        const paths = getAssetPaths('music', candidate, config.id);

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
          return;
        }
      }
    };

    void loadInitialTrack();
  }, [config.id, config.audio.menuTrack]);

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
        isSoundEnabled() &&
        !userDisabledMusic.current &&
        (autoPlay || musicEverEnabled.current);

      if (!shouldPlay) return;

      if (autoPlay) {
        musicEverEnabled.current = true;
        setEngineSoundEnabled(true);
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
      onDisableAllSounds?.();
      return;
    }

    userDisabledMusic.current = false;
    musicEverEnabled.current = true;
    setEngineSoundEnabled(true);

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

  const playMainMenu = useCallback(() => {
    const shouldAutoPlay = musicEverEnabled.current && !userDisabledMusic.current;
    void tryPlayTrackWithFallback(
      [config.audio.menuTrack, 'menu.ogg', 'MainMenu.ogg'],
      shouldAutoPlay
    );
  }, [config.audio.menuTrack, tryPlayTrackWithFallback]);

  const playGameOver = useCallback(() => {
    void tryPlayTrackWithFallback(
      [config.audio.defeatTrack, 'defeat.ogg', 'Defeat.ogg'],
      true
    );
  }, [config.audio.defeatTrack, tryPlayTrackWithFallback]);

  const playVictory = useCallback(() => {
    void tryPlayTrackWithFallback(
      [
        config.audio.victoryTrack,
        'victory.ogg',
        config.audio.defeatTrack,
        'defeat.ogg',
        'Victory.ogg',
        'Defeat.ogg',
      ],
      true
    );
  }, [config.audio.defeatTrack, config.audio.victoryTrack, tryPlayTrackWithFallback]);

  const playRetreat = useCallback(() => {
    void tryPlayTrackWithFallback(
      [
        config.audio.retreatTrack,
        'retreat.ogg',
        config.audio.victoryTrack,
        'victory.ogg',
        config.audio.defeatTrack,
        'defeat.ogg',
        'Retreat.ogg',
        'Victory.ogg',
        'Defeat.ogg',
      ],
      true
    );
  }, [
    config.audio.defeatTrack,
    config.audio.retreatTrack,
    config.audio.victoryTrack,
    tryPlayTrackWithFallback,
  ]);

  const playEndMusic = useCallback(
    (state: 'victory' | 'defeat' | 'retreat') => {
      if (state === 'victory') {
        playVictory();
        return;
      }
      if (state === 'retreat') {
        playRetreat();
        return;
      }
      playGameOver();
    },
    [playGameOver, playRetreat, playVictory]
  );

  const playCampaignMusic = useCallback(
    (campaign: Campaign) => {
      void tryPlayTrackWithFallback(
        [campaign.musicTrack, config.audio.menuTrack, 'menu.ogg'],
        true
      );
    },
    [config.audio.menuTrack, tryPlayTrackWithFallback]
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
    playRetreat,
    playEndMusic,
    playCampaignMusic,
    stopMusic,
  };
}

export default useMusicPlayer;
