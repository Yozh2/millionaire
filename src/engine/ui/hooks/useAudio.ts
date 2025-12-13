/**
 * useAudio Hook
 *
 * Public facade that composes:
 * - `useMusicPlayer` (music track switching + preference)
 * - `useSoundPlayer` (SFX/voice + tagged sounds with instant stop)
 */

import { useCallback, useEffect } from 'react';
import type { Campaign, GameConfig } from '../../types';
import { setGameId } from '../../utils/audioPlayer';
import { useMusicPlayer } from '../../audio/useMusicPlayer';
import { useSoundPlayer } from '../../audio/useSoundPlayer';

export interface UseAudioReturn {
  /** Is music currently playing (or enabled for SFX) */
  isMusicPlaying: boolean;

  /** Current track URL */
  currentTrack: string;

  /** Toggle music + global sound on/off */
  toggleMusic: () => void;

  /** Play a sound effect by config key */
  playSoundEffect: (key: keyof GameConfig['audio']['sounds']) => void;

  /** Play a sound effect by filename directly */
  playSoundFile: (filename: string) => void;

  /** Play campaign selection sound, interrupting any previous one */
  playCampaignSelectSound: (filename: string) => void;

  /** Stop campaign selection sound immediately */
  stopCampaignSelectSound: () => void;

  /** Play a companion voice line, returns true if voice was played */
  playCompanionVoice: (voiceFile: string) => Promise<boolean>;

  /** Switch to a new music track (autoPlay forces playback on user action) */
  switchMusicTrack: (trackFile: string | undefined, autoPlay?: boolean) => void;

  /** Play main menu music */
  playMainMenu: () => void;

  /** Play game over music (player lost) */
  playGameOver: () => void;

  /** Play victory music (player won all questions) */
  playVictory: () => void;

  /** Play take money music (player took money early) */
  playTakeMoney: () => void;

  /** Play end game music based on game state */
  playEndMusic: (state: 'won' | 'lost' | 'took_money') => void;

  /** Play campaign-specific music */
  playCampaignMusic: (campaign: Campaign) => void;

  /** Stop all music */
  stopMusic: () => void;
}

export const useAudio = (
  config: GameConfig,
  audioElementId: string = 'bg-music'
): UseAudioReturn => {
  useEffect(() => {
    setGameId(config.id);
  }, [config.id]);

  const {
    playSoundEffect,
    playSoundFile,
    playTaggedSound,
    stopTaggedSound,
    playCompanionVoice,
  } = useSoundPlayer(config);

  const stopCampaignSelectSound = useCallback(() => {
    stopTaggedSound('campaignSelect');
  }, [stopTaggedSound]);

  const musicPlayer = useMusicPlayer(config, {
    audioElementId,
    onDisableAllSounds: stopCampaignSelectSound,
  });

  const playCampaignSelectSound = useCallback(
    (filename: string) => {
      playTaggedSound('campaignSelect', filename);
    },
    [playTaggedSound]
  );

  useEffect(() => {
    return () => {
      stopCampaignSelectSound();
    };
  }, [stopCampaignSelectSound]);

  const stopMusic = useCallback(() => {
    musicPlayer.stopMusic();
    stopCampaignSelectSound();
  }, [musicPlayer, stopCampaignSelectSound]);

  return {
    isMusicPlaying: musicPlayer.isMusicPlaying,
    currentTrack: musicPlayer.currentTrack,
    toggleMusic: musicPlayer.toggleMusic,

    playSoundEffect,
    playSoundFile,

    playCampaignSelectSound,
    stopCampaignSelectSound,

    playCompanionVoice,

    switchMusicTrack: musicPlayer.switchMusicTrack,
    playMainMenu: musicPlayer.playMainMenu,
    playGameOver: musicPlayer.playGameOver,
    playVictory: musicPlayer.playVictory,
    playTakeMoney: musicPlayer.playTakeMoney,
    playEndMusic: musicPlayer.playEndMusic,
    playCampaignMusic: musicPlayer.playCampaignMusic,
    stopMusic,
  };
};

export default useAudio;
