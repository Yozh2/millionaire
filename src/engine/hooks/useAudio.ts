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

  /** Play a companion voice line */
  playCompanionVoice: (voiceFile: string) => void;

  /** Switch to a new music track (autoPlay forces playback on user action) */
  switchMusicTrack: (trackFile: string | undefined, autoPlay?: boolean) => void;

  /** Play main menu music */
  playMainMenu: () => void;

  /** Play game over music */
  playGameOver: () => void;

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

  // Set game ID for asset resolution on mount
  useEffect(() => {
    setGameId(config.id);
  }, [config.id]);

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
        // No track available - stop music
        audio.pause();
        audio.src = '';
        setCurrentTrack('');
        setIsMusicPlaying(false);
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

      // Only play if user has explicitly enabled music before
      // autoPlay just means "play if user already enabled sound"
      const shouldPlay = musicEverEnabled.current && !userDisabledMusic.current;

      if (shouldPlay) {
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
    },
    [config.audio.musicVolume, getAudioElement, loadTrack]
  );

  // Toggle music
  const toggleMusic = useCallback(() => {
    const audio = getAudioElement();
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
      userDisabledMusic.current = true;
      setEngineSoundEnabled(false);
    } else {
      // Set src if not already set
      if (!audio.src && currentTrack) {
        audio.src = currentTrack;
      }
      // Set volume before playing
      audio.volume = config.audio.musicVolume;
      audio
        .play()
        .then(() => {
          setIsMusicPlaying(true);
          musicEverEnabled.current = true;
          userDisabledMusic.current = false;
          setEngineSoundEnabled(true);
        })
        .catch((err) => console.log('Music play failed:', err));
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

  // Play companion voice
  const playCompanionVoice = useCallback(
    (voiceFile: string) => {
      playVoice(voiceFile, config.audio.voiceVolume);
    },
    [config.audio.voiceVolume]
  );

  // Convenience methods
  const playMainMenu = useCallback(() => {
    // Auto-play if music was ever enabled by user
    const shouldAutoPlay = musicEverEnabled.current && !userDisabledMusic.current;
    switchMusicTrack(config.audio.mainMenuTrack, shouldAutoPlay);
  }, [config.audio.mainMenuTrack, switchMusicTrack]);

  const playGameOver = useCallback(() => {
    // Auto-play if music was ever enabled by user
    const shouldAutoPlay = musicEverEnabled.current && !userDisabledMusic.current;
    switchMusicTrack(config.audio.gameOverTrack, shouldAutoPlay);
  }, [config.audio.gameOverTrack, switchMusicTrack]);

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
    playCampaignMusic,
    stopMusic,
  };
};

export default useAudio;
