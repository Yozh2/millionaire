/**
 * Game Selector Screen
 *
 * Landing page that allows users to choose which game to play.
 * Shows available games as cards with descriptions.
 */

import { Link } from 'react-router-dom';

interface GameCard {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
  borderColor: string;
  available: boolean;
}

const games: GameCard[] = [
  {
    id: 'engine',
    path: '/engine',
    title: 'ДЕМО ДВИЖКА',
    subtitle: 'Proof of Concept',
    description: 'Минимальная демонстрация движка без внешних ассетов',
    icon: '⚙️',
    gradient: 'from-slate-700 via-slate-600 to-slate-800',
    borderColor: 'border-slate-500',
    available: true,
  },
  {
    id: 'bg3',
    path: '/bg3',
    title: "BALDUR'S GATE 3",
    subtitle: 'Forgotten Realms Edition',
    description: 'Викторина по вселенной BG3 и D&D с атмосферной музыкой',
    icon: '⚔️',
    gradient: 'from-amber-700 via-amber-600 to-amber-800',
    borderColor: 'border-amber-500',
    available: true,
  },
  {
    id: 'transformers',
    path: '/transformers',
    title: 'TRANSFORMERS',
    subtitle: 'Robots in Disguise',
    description: 'Викторина по вселенной Трансформеров',
    icon: '🤖',
    gradient: 'from-red-700 via-blue-600 to-red-800',
    borderColor: 'border-red-500',
    available: false,
  },
];

export function GameSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider">
          🎯 MILLIONAIRE
        </h1>
        <p className="text-xl text-gray-400">
          Выберите игру
        </p>
      </div>

      {/* Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {games.map((game) => (
          <GameCardComponent key={game.id} game={game} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-600 text-sm">
        <p>Millionaire Quiz Engine v1.0</p>
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
  );
}

function GameCardComponent({ game }: { game: GameCard }) {
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
      <div className="text-5xl mb-2">{game.icon}</div>

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

export default GameSelector;
