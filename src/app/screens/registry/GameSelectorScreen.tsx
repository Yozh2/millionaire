/**
 * Game Selector Screen
 *
 * Landing page that allows users to choose which game to play.
 * Shows available games as cards with descriptions.
 */

import { GameCard } from '../../components/GameCard';
import { useGameSelectorScreen } from './useGameSelectorScreen';
import type { GameRegistryEntry } from './gameRegistry';

import '@app/styles/GameSelectorScreen.css';

function GameCardTile({
  entry,
  onSelect,
}: {
  entry: GameRegistryEntry;
  onSelect: (entry: GameRegistryEntry) => void;
}) {
  return (
    <GameCard
      gameId={entry.id}
      title={entry.title}
      emoji={entry.emoji}
      available={entry.available}
      ariaLabel={`Играть: ${entry.title}`}
      onSelect={() => onSelect(entry)}
    />
  );
}

export function GameSelectorScreen() {
  const { games, handleSelect } = useGameSelectorScreen();

  return (
    <div className="game-selector">
      <div className="game-selector__container">
        {/* Header */}
        <div className="game-selector__header">
          <h1 className="game-selector__title">
            🎯 Кто хочет стать миллионером?
          </h1>
          <p className="game-selector__subtitle">
            Выбери тематическую игру
          </p>
        </div>

        {/* Game Cards */}
        <div className="game-selector__cards">
          {games.map((entry) => (
            <GameCardTile
              key={entry.id}
              entry={entry}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="game-selector__footer">
          <p>Millionaire Quiz Engine</p>
          <p>
            <a
              href="https://github.com/Yozh2/millionaire"
              target="_blank"
              rel="noopener noreferrer"
              className="game-selector__footer-link"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default GameSelectorScreen;
