import { useCallback, useEffect, useState, type ComponentType } from 'react';
import type { GameConfig } from '@engine/types';
import { loadSelectedGame } from 'virtual:selected-game';

interface EngineLoadingState {
  isLoading: boolean;
  progress?: number;
}

interface MillionaireGameProps {
  config: GameConfig;
  onLoadingStateChange?: (state: EngineLoadingState) => void;
}

export function GameApp() {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [GameComponent, setGameComponent] =
    useState<ComponentType<MillionaireGameProps> | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      loadSelectedGame().then((module) => module.default.loadConfig()),
      import('@engine/ui/MillionaireGame').then(
        (module) => module.MillionaireGame,
      ),
    ])
      .then(([loadedConfig, loadedGameComponent]) => {
        if (cancelled) return;
        setConfig(loadedConfig);
        setGameComponent(() => loadedGameComponent);
        setProgress(100);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadingStateChange = useCallback((state: EngineLoadingState) => {
    if (Number.isFinite(state.progress)) {
      setProgress(state.progress ?? 0);
    }
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-8">
        <section className="max-w-xl">
          <h1 className="text-2xl font-bold mb-4">Ошибка загрузки игры</h1>
          <pre className="text-sm whitespace-pre-wrap bg-black/40 p-4 rounded">
            {error}
          </pre>
        </section>
      </main>
    );
  }

  if (!config || !GameComponent) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-8">
        <section className="w-full max-w-sm">
          <p className="text-sm uppercase tracking-[0.18em] text-gray-400 mb-3">
            Loading
          </p>
          <div className="h-2 rounded bg-white/10 overflow-hidden">
            <div
              className="h-full bg-white transition-[width]"
              style={{ width: `${Math.max(8, Math.min(100, progress))}%` }}
            />
          </div>
        </section>
      </main>
    );
  }

  return (
    <GameComponent
      config={config}
      onLoadingStateChange={handleLoadingStateChange}
    />
  );
}

export default GameApp;
