import { useCallback, useEffect, useRef, useState } from 'react';
import type { Campaign, GameConfig } from '@engine/types';
import { assetLoader, logger } from '@engine/services';
import type { CampaignAssets, GameAssets } from '@engine/services';
import {
  ensureAudioContext,
  warmUpAudioContext,
  isSoundEnabled,
  setSoundEnabled as setEngineSoundEnabled,
} from '@engine/utils/audioPlayer';
import { getAssetPaths, checkFileExists } from '@engine/utils/assetLoader';
import { withBasePath } from '@app/utils/paths';
import { getPreloadedAudioSrc } from '@engine/utils/audioPlayer';

export interface UseMusicPlayerReturn {
  isMusicPlaying: boolean;
  currentTrack: string;
  toggleMusic: () => void;
  disableAllSounds: () => void;
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

const MUSIC_EXTENSIONS = ['.m4a', '.ogg'];

const resolvePublicPath = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/')) {
    return withBasePath(path);
  }
  return path;
};

const findManifestCampaign = (
  game: GameAssets,
  campaignId: string
): CampaignAssets | null => {
  if (game.campaigns[campaignId]) {
    return game.campaigns[campaignId];
  }

  const lowerId = campaignId.toLowerCase();
  for (const [id, campaign] of Object.entries(game.campaigns)) {
    if (id.toLowerCase() === lowerId) return campaign;
  }

  return null;
};

const resolveManifestCampaignTrack = async (
  gameId: string,
  campaignId: string
): Promise<string | null> => {
  const assets = await assetLoader.getGameAssets(gameId);
  if (!assets) return null;
  const campaign = findManifestCampaign(assets, campaignId);
  return campaign?.level1_1.music ?? null;
};

const buildTrackCandidates = (
  trackFiles: (string | undefined)[],
  baseNames: string[]
): string[] => {
  const candidates = [
    ...trackFiles.filter((track): track is string => !!track),
    ...baseNames.flatMap((name) => MUSIC_EXTENSIONS.map((ext) => `${name}${ext}`)),
  ];
  return Array.from(new Set(candidates));
};

export function useMusicPlayer(
  config: GameConfig,
  { audioElementId = 'bg-music', onDisableAllSounds }: UseMusicPlayerOptions = {}
): UseMusicPlayerReturn {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');

  const musicEverEnabled = useRef(false);
  const userDisabledMusic = useRef(false);
  const wasPlayingBeforeHide = useRef(false);

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
      const candidates = buildTrackCandidates(
        [config.audio.menuTrack],
        ['menu', 'MainMenu']
      );

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

      if (trackFile.includes('/')) {
        const resolved = resolvePublicPath(trackFile);
        if (
          getPreloadedAudioSrc(resolved) ||
          (await checkFileExists(resolved))
        ) {
          return resolved;
        }
        return null;
      }

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

  const disableAllSounds = useCallback(() => {
    const audio = getAudioElement();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsMusicPlaying(false);
    userDisabledMusic.current = true;
    setEngineSoundEnabled(false);
    onDisableAllSounds?.();
  }, [getAudioElement, onDisableAllSounds]);

  const toggleMusic = useCallback(() => {
    const audio = getAudioElement();
    if (!audio) return;

    if (isMusicPlaying) {
      disableAllSounds();
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
    disableAllSounds,
  ]);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const pauseForBackground = () => {
      const audio = getAudioElement();
      if (!audio) return;

      const wasPlaying = !audio.paused && !audio.ended;
      if (wasPlaying) {
        wasPlayingBeforeHide.current = true;
        audio.pause();
        setIsMusicPlaying(false);
      }
    };

    const resumeFromBackground = () => {
      if (!wasPlayingBeforeHide.current) return;
      if (userDisabledMusic.current || !isSoundEnabled()) return;

      const audio = getAudioElement();
      if (!audio || !audio.src) return;

      ensureAudioContext();
      warmUpAudioContext();

      audio
        .play()
        .then(() => {
          setIsMusicPlaying(true);
        })
        .catch(() => {
          setIsMusicPlaying(false);
        });

      wasPlayingBeforeHide.current = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseForBackground();
      } else {
        resumeFromBackground();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', pauseForBackground);
    window.addEventListener('pageshow', resumeFromBackground);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', pauseForBackground);
      window.removeEventListener('pageshow', resumeFromBackground);
    };
  }, [getAudioElement]);

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
      buildTrackCandidates([config.audio.menuTrack], ['menu', 'MainMenu']),
      shouldAutoPlay
    );
  }, [config.audio.menuTrack, tryPlayTrackWithFallback]);

  const playGameOver = useCallback(() => {
    void tryPlayTrackWithFallback(
      buildTrackCandidates([config.audio.defeatTrack], ['defeat', 'Defeat']),
      true
    );
  }, [config.audio.defeatTrack, tryPlayTrackWithFallback]);

  const playVictory = useCallback(() => {
    void tryPlayTrackWithFallback(
      buildTrackCandidates(
        [config.audio.victoryTrack, config.audio.defeatTrack],
        ['victory', 'defeat', 'Victory', 'Defeat']
      ),
      true
    );
  }, [config.audio.defeatTrack, config.audio.victoryTrack, tryPlayTrackWithFallback]);

  const playRetreat = useCallback(() => {
    void tryPlayTrackWithFallback(
      buildTrackCandidates(
        [
          config.audio.retreatTrack,
          config.audio.victoryTrack,
          config.audio.defeatTrack,
        ],
        ['retreat', 'victory', 'defeat', 'Retreat', 'Victory', 'Defeat']
      ),
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
      const playCampaignTrack = async () => {
        const manifestTrack = await resolveManifestCampaignTrack(
          config.id,
          campaign.id
        );

        await tryPlayTrackWithFallback(
          buildTrackCandidates(
            [manifestTrack ?? undefined, campaign.musicTrack, config.audio.menuTrack],
            ['menu', 'MainMenu']
          ),
          true
        );
      };

      void playCampaignTrack();
    },
    [config.audio.menuTrack, config.id, tryPlayTrackWithFallback]
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
    disableAllSounds,
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
