import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@app/components/LoadingScreen';
import { useGameIcon, useImmediateFavicon } from '@engine/ui/hooks/useFavicon';
import type { GameConfig } from '@engine/types';
import { getGameById } from '@app/registry';

interface RegisteredGamePageProps {
  gameId: string;
}

const MillionaireGame = lazy(() => import('@engine/ui/MillionaireGame'));

export default function RegisteredGamePage({ gameId }: RegisteredGamePageProps) {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (!config) {
    return (
      <LoadingScreen
        loadingBgColor={entry?.loadingBgColor}
        theme={entry?.loadingTheme}
        logoUrl={loadingLogoUrl}
        logoEmoji={loadingLogoEmoji}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <LoadingScreen
          loadingBgColor={config.loadingBgColor}
          theme={config.campaigns[0]?.theme}
          logoUrl={loadingLogoUrl}
          logoEmoji={loadingLogoEmoji}
        />
      }
    >
      <MillionaireGame config={config} />
    </Suspense>
  );
}
