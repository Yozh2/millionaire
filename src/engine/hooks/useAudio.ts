/**
 * useAudio Hook
 *
 * Manages background music and sound effects with fallback support.
 * Handles autoplay restrictions and user preferences.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { GameConfig, Campaign } from '../types';
import {
  setGameId,
  setSoundEnabled as setEngineSoundEnabled,
  playSound,
  playVoice,
  playSoundByType,
} from '../utils/audioPlayer';
import { getAssetPaths, checkFileExists } from '../utils/assetLoader';

// ============================================
// LocalStorage helpers
// ============================================

const SOUND_ENABLED_KEY = 'millionaire_sound_enabled';

const getSavedSoundPreference = (): boolean | null => {
  try {
    const saved = localStorage.getItem(SOUND_ENABLED_KEY);
    if (saved === null) return null;
    return saved === 'true';
  } catch {
    return null;
  }
};

const saveSoundPreference = (enabled: boolean): void => {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  } catch {
    // Ignore storage errors
  }
};

// ============================================
// Types
// ============================================

export interface UseAudioReturn {
  /** Is music currently playing */
  isMusicPlaying: boolean;

  /** Current track URL */
  currentTrack: string;

  /** Toggle music on/off */
  toggleMusic: () => void;

  /** Play a sound effect by config key */
  playSoundEffect: (key: keyof GameConfig['audio']['sounds']) => void;

  /** Play a sound effect by filename directly */
  playSoundFile: (filename: string) => void;

  /** Play a companion voice line, returns true if voice was played */
  playCompanionVoice: (voiceFile: string) => Promise<boolean>;

  /** Switch to a new music track (autoPlay forces playback on user action) */
  switchMusicTrack: (trackFile: string | undefined, autoPlay?: boolean) => void;

  /** Play main menu music */
  playMainMenu: () => void;

  /**
   * Play game over music (player lost).
   * Fallback: GameOver.ogg > oscillator
   */
  playGameOver: () => void;

  /**
   * Play victory music (player won all questions).
   * Fallback: Victory.ogg > GameOver.ogg > oscillator
   */
  playVictory: () => void;

  /**
   * Play take money music (player took money early).
   * Fallback: TakeMoney.ogg > Victory.ogg > GameOver.ogg > oscillator
   */
  playTakeMoney: () => void;

  /**
   * Play end game music based on game state.
   * Automatically selects the correct track with fallbacks.
   * @param state - 'won' | 'lost' | 'took_money'
   */
  playEndMusic: (state: 'won' | 'lost' | 'took_money') => void;

  /** Play campaign-specific music */
  playCampaignMusic: (campaign: Campaign) => void;

  /** Stop all music */
  stopMusic: () => void;
}

// ============================================
// Hook
// ============================================

export const useAudio = (
  config: GameConfig,
  audioElementId: string = 'bg-music'
): UseAudioReturn => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');

  // Track if user ever enabled music (for auto-play on track switch)
  const musicEverEnabled = useRef(false);
  // Track if user manually disabled music
  const userDisabledMusic = useRef(false);
  // Track if we've already tried to restore sound on first interaction
  const hasTriedRestore = useRef(false);

  // Set game ID for asset resolution on mount
  useEffect(() => {
    setGameId(config.id);
  }, [config.id]);

  // Restore sound preference from localStorage
  useEffect(() => {
    const savedPreference = getSavedSoundPreference();
    if (savedPreference === true) {
      // User previously enabled sound - mark as enabled but don't play yet
      musicEverEnabled.current = true;
      userDisabledMusic.current = false;
      setEngineSoundEnabled(true);
      // Show as "on" for UI - music will start on first interaction
      setIsMusicPlaying(true);
    }
  }, []);

  // Load main menu track on mount
  useEffect(() => {
    const loadInitialTrack = async () => {
      if (config.audio.mainMenuTrack) {
        const paths = getAssetPaths('music', config.audio.mainMenuTrack, config.id);

        // Try specific path first
        if (await checkFileExists(paths.specific)) {
          setCurrentTrack(paths.specific);
        } else if (await checkFileExists(paths.fallback)) {
          setCurrentTrack(paths.fallback);
        }
      }
    };
    loadInitialTrack();
  }, [config.id, config.audio.mainMenuTrack]);

  // Get audio element
  const getAudioElement = useCallback((): HTMLAudioElement | null => {
    return document.getElementById(audioElementId) as HTMLAudioElement | null;
  }, [audioElementId]);

  // Try to play music on first user interaction if sound was previously enabled
  useEffect(() => {
    // Only setup listener if user previously had sound enabled
    const savedPreference = getSavedSoundPreference();
    if (savedPreference !== true) return;
    // Wait for currentTrack to be loaded
    if (!currentTrack) return;

    const tryPlayMusic = () => {
      if (hasTriedRestore.current) return;
      hasTriedRestore.current = true;

      const audio = document.getElementById(audioElementId) as HTMLAudioElement;
      if (audio) {
        audio.src = currentTrack;
        audio.volume = config.audio.musicVolume;
        audio.play().catch((err) => {
          console.log('Auto-play failed on interaction:', err);
        });
      }

      // Remove listeners after first interaction
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
  }, [audioElementId, currentTrack, config.audio.musicVolume]);

  // Resolve and load a music track
  const loadTrack = useCallback(
    async (trackFile: string | undefined): Promise<string | null> => {
      if (!trackFile) return null;

      const paths = getAssetPaths('music', trackFile, config.id);

      // Try specific path first
      if (await checkFileExists(paths.specific)) {
        return paths.specific;
      }

      // Try fallback
      if (await checkFileExists(paths.fallback)) {
        return paths.fallback;
      }

      return null;
    },
    [config.id]
  );

  // Switch to a new track
  const switchMusicTrack = useCallback(
    async (trackFile: string | undefined, autoPlay: boolean = false) => {
      const audio = getAudioElement();
      if (!audio) return;

      const trackPath = await loadTrack(trackFile);

      if (!trackPath) {
        // No track available - stop music playback but keep sound enabled state
        audio.pause();
        audio.src = '';
        setCurrentTrack('');
        // Don't reset isMusicPlaying if user has sound enabled
        // This allows oscillator sounds to continue working
        return;
      }

      // Check if it's actually a different track
      const currentFileName = audio.src.split('/').pop();
      const newFileName = trackPath.split('/').pop();

      if (currentFileName === newFileName && !audio.paused) {
        return; // Same track, already playing
      }

      audio.src = trackPath;
      audio.volume = config.audio.musicVolume;
      setCurrentTrack(trackPath);

      // Play if:
      // 1. User hasn't explicitly disabled sound, AND
      // 2. Either autoPlay is true (user action) OR user previously enabled music
      const shouldPlay = !userDisabledMusic.current && (autoPlay || musicEverEnabled.current);

      if (shouldPlay) {
        // If autoPlay, mark music as enabled for future track switches
        if (autoPlay) {
          musicEverEnabled.current = true;
          setEngineSoundEnabled(true);
          saveSoundPreference(true);
        }

        const tryPlay = () => {
          audio
            .play()
            .then(() => setIsMusicPlaying(true))
            .catch(() => { /* Autoplay blocked, user will click sound button */ });
        };

        // If audio is already ready, play immediately
        // readyState >= 3 means HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
        if (audio.readyState >= 3) {
          tryPlay();
        } else {
          const handleCanPlay = () => {
            tryPlay();
            audio.removeEventListener('canplay', handleCanPlay);
          };
          audio.addEventListener('canplay', handleCanPlay);
          audio.load();
        }
      } else {
        audio.load();
      }
    },
    [config.audio.musicVolume, getAudioElement, loadTrack]
  );

  // Toggle music
  const toggleMusic = useCallback(() => {
    const audio = getAudioElement();

    if (isMusicPlaying) {
      // Turn off music and sounds
      if (audio) {
        audio.pause();
      }
      setIsMusicPlaying(false);
      userDisabledMusic.current = true;
      setEngineSoundEnabled(false);
      saveSoundPreference(false);
    } else {
      // Turn on sounds first
      musicEverEnabled.current = true;
      userDisabledMusic.current = false;
      setEngineSoundEnabled(true);
      saveSoundPreference(true);

      // Try to play music if there's a track
      if (audio && currentTrack) {
        // Always set src to ensure it's correct
        audio.src = currentTrack;
        audio.volume = config.audio.musicVolume;
        audio
          .play()
          .then(() => setIsMusicPlaying(true))
          .catch(() => {
            // Music failed but sounds are still enabled
            setIsMusicPlaying(true); // Show as "on" for sound effects
          });
      } else {
        // No music track, but sounds are enabled
        setIsMusicPlaying(true); // Show as "on" for sound effects
      }
    }
  }, [isMusicPlaying, config.audio.musicVolume, getAudioElement, currentTrack]);

  // Play sound effect
  const playSoundEffect = useCallback(
    (key: keyof GameConfig['audio']['sounds']) => {
      const soundFile = config.audio.sounds[key];
      if (soundFile) {
        playSound(soundFile, config.audio.soundVolume);
      } else {
        // Try to play oscillator by key name
        playSoundByType(key as any);
      }
    },
    [config.audio.sounds, config.audio.soundVolume]
  );

  // Play sound by filename directly
  const playSoundFile = useCallback(
    (filename: string) => {
      playSound(filename, config.audio.soundVolume);
    },
    [config.audio.soundVolume]
  );

  // Play companion voice, returns true if voice file was found and played
  const playCompanionVoice = useCallback(
    async (voiceFile: string): Promise<boolean> => {
      return playVoice(voiceFile, config.audio.voiceVolume);
    },
    [config.audio.voiceVolume]
  );

  // Convenience methods
  const playMainMenu = useCallback(() => {
    // Auto-play if music was ever enabled by user
    const shouldAutoPlay = musicEverEnabled.current && !userDisabledMusic.current;
    switchMusicTrack(config.audio.mainMenuTrack, shouldAutoPlay);
  }, [config.audio.mainMenuTrack, switchMusicTrack]);

  /**
   * Try to play a track with fallback chain.
   * Returns true if a track was found and playback was initiated.
   */
  const tryPlayTrackWithFallback = useCallback(
    async (trackFiles: (string | undefined)[], autoPlay: boolean = false): Promise<boolean> => {
      for (const trackFile of trackFiles) {
        if (!trackFile) continue;

        const trackPath = await loadTrack(trackFile);
        if (trackPath) {
          const audio = getAudioElement();
          if (!audio) return false;

          // Check if it's actually a different track
          const currentFileName = audio.src.split('/').pop();
          const newFileName = trackPath.split('/').pop();

          if (currentFileName === newFileName && !audio.paused) {
            return true; // Same track, already playing
          }

          audio.src = trackPath;
          audio.volume = config.audio.musicVolume;
          setCurrentTrack(trackPath);

          // Play if:
          // 1. User hasn't explicitly disabled sound, AND
          // 2. Either autoPlay is true OR user previously enabled music
          const shouldPlay =
            !userDisabledMusic.current && (autoPlay || musicEverEnabled.current);

          if (shouldPlay) {
            // If autoPlay, mark music as enabled for future track switches
            if (autoPlay) {
              musicEverEnabled.current = true;
              setEngineSoundEnabled(true);
              saveSoundPreference(true);
            }
            const handleCanPlay = () => {
              audio
                .play()
                .then(() => setIsMusicPlaying(true))
                .catch((err) => console.log('Track play failed:', err));
              audio.removeEventListener('canplay', handleCanPlay);
            };
            audio.addEventListener('canplay', handleCanPlay);
            audio.load();
          } else {
            audio.load();
          }
          return true;
        }
      }
      return false;
    },
    [config.audio.musicVolume, getAudioElement, loadTrack]
  );

  /**
   * Play game over music (player lost).
   * Fallback: GameOver.ogg > oscillator (via switchMusicTrack with undefined)
   */
  const playGameOver = useCallback(async () => {
    const found = await tryPlayTrackWithFallback([config.audio.gameOverTrack]);
    if (!found) {
      // No track found - stop music, oscillators will handle sounds
      const audio = getAudioElement();
      if (audio) {
        audio.pause();
        audio.src = '';
        setCurrentTrack('');
      }
    }
  }, [config.audio.gameOverTrack, tryPlayTrackWithFallback, getAudioElement]);

  /**
   * Play victory music (player won all questions).
   * Fallback: Victory.ogg > GameOver.ogg > oscillator
   */
  const playVictory = useCallback(async () => {
    const found = await tryPlayTrackWithFallback([
      config.audio.victoryTrack,
      config.audio.gameOverTrack,
    ]);
    if (!found) {
      // No track found - stop music, oscillators will handle sounds
      const audio = getAudioElement();
      if (audio) {
        audio.pause();
        audio.src = '';
        setCurrentTrack('');
      }
    }
  }, [
    config.audio.victoryTrack,
    config.audio.gameOverTrack,
    tryPlayTrackWithFallback,
    getAudioElement,
  ]);

  /**
   * Play take money music (player took money early).
   * Fallback: TakeMoney.ogg > Victory.ogg > GameOver.ogg > oscillator
   */
  const playTakeMoney = useCallback(async () => {
    const found = await tryPlayTrackWithFallback([
      config.audio.takeMoneyTrack,
      config.audio.victoryTrack,
      config.audio.gameOverTrack,
    ]);
    if (!found) {
      // No track found - stop music, oscillators will handle sounds
      const audio = getAudioElement();
      if (audio) {
        audio.pause();
        audio.src = '';
        setCurrentTrack('');
      }
    }
  }, [
    config.audio.takeMoneyTrack,
    config.audio.victoryTrack,
    config.audio.gameOverTrack,
    tryPlayTrackWithFallback,
    getAudioElement,
  ]);

  /**
   * Play end game music based on game state.
   * Automatically selects the correct track with fallbacks.
   */
  const playEndMusic = useCallback(
    (state: 'won' | 'lost' | 'took_money') => {
      switch (state) {
        case 'won':
          playVictory();
          break;
        case 'lost':
          playGameOver();
          break;
        case 'took_money':
          playTakeMoney();
          break;
      }
    },
    [playVictory, playGameOver, playTakeMoney]
  );

  const playCampaignMusic = useCallback(
    (campaign: Campaign) => {
      // Use autoPlay=true because this is triggered by user action (start game)
      switchMusicTrack(campaign.musicTrack, true);
    },
    [switchMusicTrack]
  );

  const stopMusic = useCallback(() => {
    const audio = getAudioElement();
    if (audio) {
      audio.pause();
      setIsMusicPlaying(false);
    }
  }, [getAudioElement]);

  return {
    isMusicPlaying,
    currentTrack,
    toggleMusic,
    playSoundEffect,
    playSoundFile,
    playCompanionVoice,
    switchMusicTrack,
    playMainMenu,
    playGameOver,
    playVictory,
    playTakeMoney,
    playEndMusic,
    playCampaignMusic,
    stopMusic,
  };
};

export default useAudio;
