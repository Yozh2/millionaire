/**
 * Hook for managing particle effects in the game.
 * Provides a simple API to trigger visual effects.
 */

import { useState, useCallback, useRef } from 'react';
import type { EffectType } from '../components/ParticleCanvas';

interface EffectState {
  effect: EffectType | null;
  origin: { x: number; y: number };
  primaryColor: string;
  secondaryColor: string;
  intensity: number;
}

interface UseEffectsReturn {
  /** Current effect state to pass to ParticleCanvas */
  effectState: EffectState;
  /** Trigger confetti effect (for wins) */
  triggerConfetti: (origin?: { x: number; y: number }) => void;
  /** Trigger sparks effect (for correct answers) */
  triggerSparks: (origin?: { x: number; y: number }) => void;
  /** Trigger pulse effect (for hints) */
  triggerPulse: (
    origin?: { x: number; y: number },
    color?: string
  ) => void;
  /** Trigger fireworks effect (for big wins) */
  triggerFireworks: () => void;
  /** Clear current effect */
  clearEffect: () => void;
}

const DEFAULT_STATE: EffectState = {
  effect: null,
  origin: { x: 0.5, y: 0.5 },
  primaryColor: '#FFD700',
  secondaryColor: '#FF6B6B',
  intensity: 1,
};

/**
 * Hook for managing particle visual effects.
 * 
 * @example
 * ```tsx
 * const { effectState, triggerConfetti, triggerSparks } = useEffects();
 * 
 * // In component
 * <ParticleCanvas {...effectState} />
 * 
 * // Trigger effects
 * triggerConfetti(); // Full screen confetti
 * triggerSparks({ x: 0.5, y: 0.3 }); // Sparks at specific position
 * ```
 */
export const useEffects = (): UseEffectsReturn => {
  const [effectState, setEffectState] = useState<EffectState>(DEFAULT_STATE);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearEffect = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setEffectState((prev) => ({ ...prev, effect: null }));
  }, []);

  const triggerEffect = useCallback(
    (
      effect: EffectType,
      options: Partial<Omit<EffectState, 'effect'>> = {}
    ) => {
      // Clear previous effect first
      clearEffect();
      
      // Small delay to ensure effect rerenders
      requestAnimationFrame(() => {
        setEffectState({
          effect,
          origin: options.origin ?? { x: 0.5, y: 0.5 },
          primaryColor: options.primaryColor ?? '#FFD700',
          secondaryColor: options.secondaryColor ?? '#FF6B6B',
          intensity: options.intensity ?? 1,
        });
      });

      // Auto-clear effect after animation completes
      // This allows retriggering the same effect type
      timeoutRef.current = setTimeout(() => {
        setEffectState((prev) => ({ ...prev, effect: null }));
      }, 3000);
    },
    [clearEffect]
  );

  const triggerConfetti = useCallback(
    (origin?: { x: number; y: number }) => {
      triggerEffect('confetti', {
        origin: origin ?? { x: 0.5, y: 0.7 },
        intensity: 1.2,
      });
    },
    [triggerEffect]
  );

  const triggerSparks = useCallback(
    (origin?: { x: number; y: number }) => {
      triggerEffect('sparks', {
        origin: origin ?? { x: 0.5, y: 0.5 },
        primaryColor: '#FFD700',
        secondaryColor: '#FFFFFF',
        intensity: 1,
      });
    },
    [triggerEffect]
  );

  const triggerPulse = useCallback(
    (origin?: { x: number; y: number }, color?: string) => {
      triggerEffect('pulse', {
        origin: origin ?? { x: 0.5, y: 0.5 },
        primaryColor: color ?? '#4ECDC4',
        secondaryColor: color ?? '#45B7D1',
        intensity: 1,
      });
    },
    [triggerEffect]
  );

  const triggerFireworks = useCallback(() => {
    triggerEffect('fireworks', {
      origin: { x: 0.5, y: 0.3 },
      intensity: 1.5,
    });
  }, [triggerEffect]);

  return {
    effectState,
    triggerConfetti,
    triggerSparks,
    triggerPulse,
    triggerFireworks,
    clearEffect,
  };
};

export default useEffects;
