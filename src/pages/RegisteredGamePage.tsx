import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@app/components/LoadingScreen';
import { useGameIcon, useImmediateFavicon } from '@engine/ui/hooks/useFavicon';
import type { GameConfig } from '@engine/types';
import { getGameById } from '@app/registry';

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

  const entry = useMemo(() => getGameById(gameId), [gameId]);
  const { iconUrl: gameIconUrl, emoji: gameEmoji } = useGameIcon(
    gameId,
    entry?.emoji,
    entry?.faviconUrl
  );
  useImmediateFavicon(entry?.faviconUrl, !config);
  const loadingLogoUrl = entry?.faviconUrl ?? gameIconUrl ?? undefined;
  const loadingLogoEmoji = entry?.emoji ?? gameEmoji;

  useEffect(() => {
    setConfig(null);
    setError(null);
    setEngineLoading(null);

    if (!entry) return;

    let cancelled = false;
    entry
      .getConfig()
      .then((loaded) => {
        if (!cancelled) setConfig(loaded);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [entry]);

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
  }, []);

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

  const isBooting = !config || !GameComponent;
  const isEngineLoading = engineLoading?.isLoading ?? !isBooting;
  const shouldShowLoading = isBooting || isEngineLoading;
  const loadingProgress = isBooting ? undefined : engineLoading?.progress;
  const loadingBgColor = config?.loadingBgColor ?? entry?.loadingBgColor;
  const loadingTheme = config?.campaigns[0]?.theme ?? entry?.loadingTheme;

  return (
    <>
      {GameComponent && config && (
        <GameComponent
          config={config}
          onLoadingStateChange={handleLoadingStateChange}
        />
      )}
      {shouldShowLoading && (
        <LoadingScreen
          progress={loadingProgress}
          loadingBgColor={loadingBgColor}
          theme={loadingTheme}
          logoUrl={loadingLogoUrl}
          logoEmoji={loadingLogoEmoji}
        />
      )}
    </>
  );
}
