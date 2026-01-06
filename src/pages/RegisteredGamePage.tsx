import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { Navigate } from 'react-router-dom';
import { useFavicon, useGameIcon } from '@app/hooks/useFavicon';
import type { GameConfig } from '@engine/types';
import { getGameById } from '@app/screens/registry';
import { useLoading, useLoadingPhase } from '@app/screens/loading/LoadingOrchestrator';

interface RegisteredGamePageProps {
  gameId: string;
}

interface EngineLoadingState {
  isLoading: boolean;
  progress?: number;
}

interface MillionaireGameProps {
  config: GameConfig;
  onLoadingStateChange?: (state: EngineLoadingState) => void;
}

export default function RegisteredGamePage({ gameId }: RegisteredGamePageProps) {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [GameComponent, setGameComponent] =
    useState<ComponentType<MillionaireGameProps> | null>(null);
  const [engineLoading, setEngineLoading] = useState<EngineLoadingState | null>(
    null
  );
  const { setAppearance } = useLoading();
  const enginePhase = useLoadingPhase('engine');
  const assetsPhase = useLoadingPhase('assets');
  const wasEngineLoadingRef = useRef(false);

  const entry = useMemo(() => getGameById(gameId), [gameId]);
  const { iconUrl: gameIconUrl, emoji: gameEmoji } = useGameIcon(
    gameId,
    entry?.emoji
  );
  useFavicon(entry?.id ?? null, entry?.emoji);
  const loadingLogoUrl = gameIconUrl ?? undefined;
  const loadingLogoEmoji = entry?.emoji ?? gameEmoji;

  useEffect(() => {
    enginePhase.setEnabled(true);
    assetsPhase.setEnabled(true);
    enginePhase.reset();
    assetsPhase.reset();

    return () => {
      enginePhase.setEnabled(false);
      assetsPhase.setEnabled(false);
    };
  }, [assetsPhase, enginePhase, gameId]);

  useEffect(() => {
    setAppearance({
      theme: entry?.theme,
      logoUrl: loadingLogoUrl,
      logoEmoji: loadingLogoEmoji,
    });
  }, [entry?.theme, loadingLogoEmoji, loadingLogoUrl, setAppearance]);

  useEffect(() => {
    if (!error) return;
    enginePhase.complete();
    assetsPhase.complete();
  }, [assetsPhase, enginePhase, error]);

  useEffect(() => {
    setConfig(null);
    setError(null);
    setEngineLoading(null);

    if (!entry) return;

    enginePhase.start();

    let cancelled = false;
    entry
      .getConfig()
      .then((loaded) => {
        if (!cancelled) setConfig(loaded as GameConfig);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [enginePhase, entry]);

  useEffect(() => {
    let cancelled = false;

    import('@engine/ui/MillionaireGame')
      .then((mod) => {
        if (!cancelled) setGameComponent(() => mod.MillionaireGame);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [enginePhase]);

  if (!entry) {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-8">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold mb-4">Ошибка загрузки игры</h1>
          <p className="text-gray-300 mb-4">{entry.id}</p>
          <pre className="text-sm whitespace-pre-wrap bg-black/40 p-4 rounded">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  const handleLoadingStateChange = useCallback((state: EngineLoadingState) => {
    setEngineLoading(state);
  }, []);

  useEffect(() => {
    const configReady = Boolean(config);
    const componentReady = Boolean(GameComponent);
    const progress =
      (configReady ? 0.4 : 0) + (componentReady ? 0.6 : 0);

    if (configReady && componentReady) {
      enginePhase.complete();
      return;
    }

    enginePhase.setProgress(progress);
  }, [GameComponent, config, enginePhase]);

  useEffect(() => {
    if (!engineLoading) return;

    const wasLoading = wasEngineLoadingRef.current;
    wasEngineLoadingRef.current = engineLoading.isLoading;

    if (engineLoading.isLoading && !wasLoading) {
      assetsPhase.reset();
    }

    if (engineLoading.isLoading) {
      if (Number.isFinite(engineLoading.progress)) {
        assetsPhase.setProgress((engineLoading.progress ?? 0) / 100);
      } else {
        assetsPhase.start();
      }
      return;
    }

    assetsPhase.complete();
  }, [assetsPhase, engineLoading]);

  return (
    <>
      {GameComponent && config && (
        <GameComponent
          config={config}
          onLoadingStateChange={handleLoadingStateChange}
        />
      )}
    </>
  );
}
