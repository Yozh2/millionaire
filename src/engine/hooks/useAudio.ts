/**
 * useAudio Hook
 * 
 * Manages background music and sound effects with fallback support.
 * Handles autoplay restrictions and user preferences.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { GameConfig, GameMode } from '../types';
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

  /** Toggle music on/off */
  toggleMusic: () => void;

  /** Play a sound effect by config key */
  playSoundEffect: (key: keyof GameConfig['audio']['sounds']) => void;

  /** Play a companion voice line */
  playCompanionVoice: (voiceFile: string) => void;

  /** Switch to a new music track */
  switchMusicTrack: (trackFile: string | undefined) => void;

  /** Play main menu music */
  playMainMenu: () => void;

  /** Play game over music */
  playGameOver: () => void;

  /** Play mode-specific music */
  playModeMusic: (mode: GameMode) => void;

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

  // Track if user ever enabled music (for auto-play on track switch)
  const musicEverEnabled = useRef(false);
  // Track if user manually disabled music
  const userDisabledMusic = useRef(false);

  // Set game ID for asset resolution on mount
  useEffect(() => {
    setGameId(config.id);
  }, [config.id]);

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
    async (trackFile: string | undefined) => {
      const audio = getAudioElement();
      if (!audio) return;

      const trackPath = await loadTrack(trackFile);

      if (!trackPath) {
        // No track available - stop music
        audio.pause();
        audio.src = '';
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
  }, [isMusicPlaying, config.audio.musicVolume, getAudioElement]);

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

  // Play companion voice
  const playCompanionVoice = useCallback(
    (voiceFile: string) => {
      playVoice(voiceFile, config.audio.voiceVolume);
    },
    [config.audio.voiceVolume]
  );

  // Convenience methods
  const playMainMenu = useCallback(() => {
    switchMusicTrack(config.audio.mainMenuTrack);
  }, [config.audio.mainMenuTrack, switchMusicTrack]);

  const playGameOver = useCallback(() => {
    switchMusicTrack(config.audio.gameOverTrack);
  }, [config.audio.gameOverTrack, switchMusicTrack]);

  const playModeMusic = useCallback(
    (mode: GameMode) => {
      switchMusicTrack(mode.musicTrack);
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
    toggleMusic,
    playSoundEffect,
    playCompanionVoice,
    switchMusicTrack,
    playMainMenu,
    playGameOver,
    playModeMusic,
    stopMusic,
  };
};

export default useAudio;
