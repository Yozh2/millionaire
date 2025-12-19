/**
 * Game Selector Screen
 *
 * Landing page that allows users to choose which game to play.
 * Shows available games as cards with descriptions.
 */

import { useNavigate } from 'react-router-dom';

import { LoadingScreen, useAssetPreloader, useFavicon } from '@engine';
import { GameCard } from '@engine/ui/components/cards/game/GameCard';
import { getSelectorEntries, type GameRegistryEntry } from '../registry';

function GameCardTile({
  entry,
  onSelect,
}: {
  entry: GameRegistryEntry;
  onSelect: (routePath: string) => void;
}) {
  return (
    <GameCard
      gameId={entry.id}
      gameTitle={entry.gameTitle}
      fallbackEmoji={entry.emoji}
      available={entry.available}
      ariaLabel={`Играть: ${entry.gameTitle}`}
      onSelect={() => onSelect(entry.routePath)}
    />
  );
}

export function GameSelector() {
  // Set page favicon (shared icons → default emoji)
  useFavicon(null);

  const navigate = useNavigate();

  // Preload Level 0 assets (engine + game card icons)
  const { isLoading, progress } = useAssetPreloader('level0');

  // Show loading screen while preloading
  if (isLoading) {
    return (
      <LoadingScreen
        progress={progress}
        title="Загрузка игр..."
        subtitle="Подготавливаем викторину"
      />
    );
  }

  const games = getSelectorEntries();

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🎯 Кто хочет стать миллионером?
          </h1>
          <p className="text-gray-400 text-lg">
            Выбери тематическую игру и проверь свои знания
          </p>
        </div>

        {/* Game Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {games.map((entry) => (
            <GameCardTile
              key={entry.id}
              entry={entry}
              onSelect={(routePath) => entry.available && navigate(routePath)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Универсальный движок викторины • v2.0</p>
          <p className="mt-1">
            <a
              href="https://github.com/Yozh2/millionaire"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default GameSelector;
