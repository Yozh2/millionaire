/**
 * Game Selector Screen
 *
 * Landing page that allows users to choose which game to play.
 * Shows available games as cards with descriptions.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameCard } from './GameCard';
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
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const prefix = base.endsWith('/') ? base : `${base}/`;
    const href = `${prefix}icons/favicon.svg`;

    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="manifest"]',
    ];
    document.querySelectorAll(selectors.join(', ')).forEach((el) => el.remove());

    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.sizes = 'any';
    link.href = href;
    document.head.appendChild(link);
  }, []);

  const navigate = useNavigate();

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
          <h1 className="w-full max-w-full mx-auto text-[clamp(16px,5.5vw,56px)] font-bold text-white mb-4 whitespace-nowrap">
            🎯 Кто хочет стать миллионером?
          </h1>
          <p className="text-gray-400 text-[clamp(13px,3.7vw,18px)]">
            Выбери тематическую игру
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
          <p>Millionaire Quiz Engine</p>
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
