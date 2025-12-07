/**
 * Game Selector Screen
 *
 * Landing page that allows users to choose which game to play.
 * Shows available games as cards with descriptions.
 */

import { Link } from 'react-router-dom';

import { LoadingScreen } from '../engine/components/LoadingScreen';
import { useFavicon, useGameIcon, useAssetPreloader } from '../engine/hooks';

interface GameCardData {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  gradient: string;
  borderColor: string;
  available: boolean;
}

const GAMES: GameCardData[] = [
  {
    id: 'poc',
    path: '/poc',
    title: 'PROOF OF CONCEPT',
    subtitle: 'Тестовая игра',
    description: 'Минимальная демонстрация движка без внешних ассетов',
    emoji: '⚙️',
    gradient: 'from-slate-700 via-slate-600 to-slate-800',
    borderColor: 'border-slate-500',
    available: true,
  },
  {
    id: 'bg3',
    path: '/bg3',
    title: "BALDUR'S GATE 3",
    subtitle: 'Forgotten Realms Edition',
    description: 'Викторина по вселенной Baldur\'s Gate 3',
    emoji: '⚔️',
    gradient: 'from-amber-700 via-amber-600 to-amber-800',
    borderColor: 'border-amber-500',
    available: true,
  },
  {
    id: 'transformers',
    path: '/transformers',
    title: 'TRANSFORMERS',
    subtitle: 'COMICS EDITION',
    description: 'Викторина по комиксам про Трансформеров',
    emoji: '🤖',
    gradient: 'from-purple-700 via-red-600 to-purple-800',
    borderColor: 'border-purple-500',
    available: true,
  },
];

/**
 * Game icon component that loads favicon with fallback to emoji.
 */
function GameIcon({ gameId, fallbackEmoji }: { gameId: string; fallbackEmoji: string }) {
  const { iconUrl, isEmoji, emoji } = useGameIcon(gameId, fallbackEmoji);

  if (isEmoji || !iconUrl) {
    // Show emoji (either as fallback or while loading)
    return <span className="text-5xl">{emoji}</span>;
  }

  // Image favicon
  return (
    <img
      src={iconUrl}
      alt={`${gameId} icon`}
      className="w-12 h-12 object-contain"
    />
  );
}

function GameCard({ game }: { game: GameCardData }) {
  const CardContent = (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 ${game.borderColor}
        bg-gradient-to-br ${game.gradient}
        p-6 h-64 flex flex-col justify-between
        transition-all duration-300
        ${game.available
          ? 'hover:scale-105 hover:shadow-2xl cursor-pointer'
          : 'opacity-50 cursor-not-allowed'}
      `}
    >
      {/* Icon */}
      <div className="mb-2">
        <GameIcon gameId={game.id} fallbackEmoji={game.emoji} />
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{game.title}</h2>
        <p className="text-sm text-white/70 mb-3">{game.subtitle}</p>
        <p className="text-sm text-white/60">{game.description}</p>
      </div>

      {/* Status Badge */}
      {!game.available && (
        <div className="absolute top-4 right-4 bg-gray-900/80 text-gray-300 px-3 py-1 rounded-full text-xs">
          Скоро
        </div>
      )}

      {/* Play indicator */}
      {game.available && (
        <div className="absolute bottom-4 right-4 text-white/80 text-sm flex items-center gap-1">
          Играть →
        </div>
      )}
    </div>
  );

  if (game.available) {
    return <Link to={game.path}>{CardContent}</Link>;
  }

  return CardContent;
}

export function GameSelector() {
  // Set page favicon (shared icons → default emoji)
  useFavicon(null);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {/* Sandbox Link */}
        <div className="text-center mt-12">
          <Link
            to="/sandbox"
            className="text-gray-500 hover:text-amber-400 transition-colors text-sm"
          >
            🎨 Effects Sandbox (для разработчиков)
          </Link>
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
