import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { BaseTheme } from '@app/types';

export type LoadingPhase = 'boot' | 'app' | 'engine' | 'assets';
export type LoadingMode = 'light' | 'dark';

type PhaseStatus = 'idle' | 'loading' | 'done';

interface PhaseState {
  enabled: boolean;
  status: PhaseStatus;
  progress: number;
  indeterminate: boolean;
  startedAt: number | null;
}

export interface LoadingAppearance {
  theme?: BaseTheme;
  loadingBgColor?: string;
  logoUrl?: string;
  logoEmoji?: string;
  mode?: LoadingMode;
}

interface LoadingState {
  progress: number;
  targetProgress: number;
  active: boolean;
  phaseProgress: Record<LoadingPhase, number>;
  appearance: LoadingAppearance;
}

interface LoadingActions {
  setAppearance: (appearance: Partial<LoadingAppearance>) => void;
  setPhaseEnabled: (phase: LoadingPhase, enabled: boolean) => void;
  startPhase: (phase: LoadingPhase) => void;
  setPhaseProgress: (phase: LoadingPhase, progress: number) => void;
  completePhase: (phase: LoadingPhase) => void;
  resetPhase: (phase: LoadingPhase) => void;
  resetAll: () => void;
  trackPhase: <T>(phase: LoadingPhase, task: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<(LoadingState & LoadingActions) | null>(
  null
);

const PHASE_WEIGHTS: Record<LoadingPhase, number> = {
  boot: 10,
  app: 10,
  engine: 30,
  assets: 50,
};

const INDTERMINATE_CAP: Record<LoadingPhase, number> = {
  boot: 0.85,
  app: 0.9,
  engine: 0.92,
  assets: 0.9,
};

const INDTERMINATE_DURATION_MS: Record<LoadingPhase, number> = {
  boot: 650,
  app: 1100,
  engine: 1800,
  assets: 2200,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const createPhaseState = (enabled: boolean): PhaseState => ({
  enabled,
  status: 'idle',
  progress: 0,
  indeterminate: false,
  startedAt: null,
});

const useRafTime = (active: boolean): number => {
  const [now, setNow] = useState(() => (active ? performance.now() : 0));

  useEffect(() => {
    if (!active) return;

    let frameId = 0;

    const tick = () => {
      setNow(performance.now());
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [active]);

  return now;
};

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<LoadingAppearance>({});
  const [cycle, setCycle] = useState(0);
  const [phases, setPhases] = useState<Record<LoadingPhase, PhaseState>>(() => ({
    boot: createPhaseState(true),
    app: createPhaseState(true),
    engine: createPhaseState(false),
    assets: createPhaseState(false),
  }));

  const hasIndeterminate = useMemo(() => {
    return Object.values(phases).some(
      (phase) => phase.enabled && phase.status === 'loading' && phase.indeterminate
    );
  }, [phases]);

  const now = useRafTime(hasIndeterminate);

  const phaseProgress = useMemo(() => {
    const progress: Record<LoadingPhase, number> = {
      boot: 0,
      app: 0,
      engine: 0,
      assets: 0,
    };

    (Object.keys(phases) as LoadingPhase[]).forEach((phase) => {
      const state = phases[phase];
      if (!state.enabled) {
        progress[phase] = 0;
        return;
      }

      if (state.status === 'done') {
        progress[phase] = 1;
        return;
      }

      if (state.status === 'idle') {
        progress[phase] = 0;
        return;
      }

      if (state.indeterminate) {
        if (state.startedAt == null) {
          progress[phase] = state.progress;
          return;
        }

        const elapsed = Math.max(0, now - state.startedAt);
        const duration = INDTERMINATE_DURATION_MS[phase];
        const cap = INDTERMINATE_CAP[phase];
        const auto = duration > 0 ? Math.min(cap, (elapsed / duration) * cap) : 0;
        progress[phase] = Math.max(state.progress, auto);
        return;
      }

      progress[phase] = state.progress;
    });

    return progress;
  }, [now, phases]);

  const totalWeight = useMemo(() => {
    return (Object.keys(PHASE_WEIGHTS) as LoadingPhase[]).reduce(
      (sum, phase) => (phases[phase].enabled ? sum + PHASE_WEIGHTS[phase] : sum),
      0
    );
  }, [phases]);

  const targetProgress = useMemo(() => {
    if (totalWeight <= 0) return 1;

    const weighted = (Object.keys(PHASE_WEIGHTS) as LoadingPhase[]).reduce(
      (sum, phase) => {
        if (!phases[phase].enabled) return sum;
        return sum + phaseProgress[phase] * PHASE_WEIGHTS[phase];
      },
      0
    );

    return clamp(weighted / totalWeight, 0, 1);
  }, [phaseProgress, phases, totalWeight]);

  const [maxProgress, setMaxProgress] = useState(targetProgress);
  const lastCycleRef = useRef(cycle);

  useEffect(() => {
    if (lastCycleRef.current !== cycle) {
      lastCycleRef.current = cycle;
      setMaxProgress(targetProgress);
      return;
    }

    setMaxProgress((prev) => Math.max(prev, targetProgress));
  }, [cycle, targetProgress]);

  const progress = Math.round(clamp(maxProgress * 100, 0, 100) * 10) / 10;
  const active = maxProgress < 0.999;

  const setAppearance = useCallback((next: Partial<LoadingAppearance>) => {
    setAppearanceState((prev) => ({ ...prev, ...next }));
  }, []);

  const setPhaseEnabled = useCallback((phase: LoadingPhase, enabled: boolean) => {
    let didChange = false;
    setPhases((prev) => {
      const current = prev[phase];
      if (current.enabled === enabled) return prev;
      didChange = true;
      return {
        ...prev,
        [phase]: {
          ...current,
          enabled,
        },
      };
    });
    if (didChange) {
      setCycle((value) => value + 1);
    }
  }, []);

  const startPhase = useCallback((phase: LoadingPhase) => {
    const startedAt = performance.now();
    setPhases((prev) => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        enabled: true,
        status: 'loading',
        indeterminate: true,
        progress: 0,
        startedAt,
      },
    }));
  }, []);

  const setPhaseProgress = useCallback((phase: LoadingPhase, next: number) => {
    const startedAt = performance.now();
    setPhases((prev) => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        enabled: true,
        status: 'loading',
        indeterminate: false,
        progress: clamp(next, 0, 1),
        startedAt: prev[phase].startedAt ?? startedAt,
      },
    }));
  }, []);

  const completePhase = useCallback((phase: LoadingPhase) => {
    setPhases((prev) => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        enabled: true,
        status: 'done',
        indeterminate: false,
        progress: 1,
        startedAt: prev[phase].startedAt,
      },
    }));
  }, []);

  const resetPhase = useCallback((phase: LoadingPhase) => {
    setPhases((prev) => ({
      ...prev,
      [phase]: {
        ...prev[phase],
        status: 'idle',
        indeterminate: false,
        progress: 0,
        startedAt: null,
      },
    }));
    setCycle((value) => value + 1);
  }, []);

  const resetAll = useCallback(() => {
    setPhases((prev) => {
      const next = { ...prev };
      (Object.keys(next) as LoadingPhase[]).forEach((phase) => {
        next[phase] = {
          ...next[phase],
          status: 'idle',
          indeterminate: false,
          progress: 0,
          startedAt: null,
        };
      });
      return next;
    });
    setCycle((value) => value + 1);
  }, []);

  const trackPhase = useCallback(
    async <T,>(phase: LoadingPhase, task: () => Promise<T>) => {
      startPhase(phase);
      try {
        const result = await task();
        completePhase(phase);
        return result;
      } catch (error) {
        completePhase(phase);
        throw error;
      }
    },
    [completePhase, startPhase]
  );

  useEffect(() => {
    startPhase('boot');
    const timeout = window.setTimeout(() => completePhase('boot'), 220);
    return () => window.clearTimeout(timeout);
  }, [completePhase, startPhase]);

  const value = useMemo(
    () => ({
      progress,
      targetProgress,
      active,
      phaseProgress,
      appearance,
      setAppearance,
      setPhaseEnabled,
      startPhase,
      setPhaseProgress,
      completePhase,
      resetPhase,
      resetAll,
      trackPhase,
    }),
    [
      active,
      appearance,
      completePhase,
      phaseProgress,
      progress,
      resetAll,
      resetPhase,
      setAppearance,
      setPhaseEnabled,
      setPhaseProgress,
      startPhase,
      targetProgress,
      trackPhase,
    ]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return ctx;
}

export function useLoadingPhase(phase: LoadingPhase) {
  const {
    startPhase,
    setPhaseProgress,
    completePhase,
    resetPhase,
    setPhaseEnabled,
    trackPhase,
  } = useLoading();

  return useMemo(
    () => ({
      start: () => startPhase(phase),
      setProgress: (next: number) => setPhaseProgress(phase, next),
      complete: () => completePhase(phase),
      reset: () => resetPhase(phase),
      setEnabled: (enabled: boolean) => setPhaseEnabled(phase, enabled),
      track: <T,>(task: () => Promise<T>) => trackPhase(phase, task),
    }),
    [
      completePhase,
      phase,
      resetPhase,
      setPhaseEnabled,
      setPhaseProgress,
      startPhase,
      trackPhase,
    ]
  );
}
