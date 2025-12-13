/**
 * Millionaire Quiz Engine - Main App
 *
 * A "Who Wants to Be a Millionaire" style quiz game engine
 * supporting multiple themed games.
 *
 * Routes:
 * - /         → Game selector
 * - /poc      → PoC game (no external assets)
 * - /bg3      → Baldur's Gate 3 Edition
 * - /transformers → Transformers Edition
 * - /sky-cotl → Sky: Children of the Light Edition
 * - /sandbox  → Effects demo page
 *
 * @author Yozh2
 * @see https://github.com/Yozh2/millionaire
 */

import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GameSelector } from './app/components/GameSelector';
import { getGameEntries, getPageEntries } from './app/registry';
import RegisteredGamePage from './pages/RegisteredGamePage';

const GAME_ENTRIES = getGameEntries();
const PAGE_ENTRIES = getPageEntries();

const LAZY_PAGES: Record<string, LazyExoticComponent<ComponentType>> =
  Object.fromEntries(PAGE_ENTRIES.map((entry) => [entry.id, lazy(entry.getComponent)]));

/**
 * Loading spinner component
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">🎯</div>
        <p className="text-gray-400 text-xl">Загрузка...</p>
      </div>
    </div>
  );
}

/**
 * Main application component with routing.
 */
export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<GameSelector />} />
        {GAME_ENTRIES.map((entry) => (
          <Route
            key={entry.id}
            path={entry.routePath}
            element={<RegisteredGamePage gameId={entry.id} />}
          />
        ))}
        {PAGE_ENTRIES.map((entry) => {
          const Component = LAZY_PAGES[entry.id];
          return (
            <Route
              key={entry.id}
              path={entry.routePath}
              element={<Component />}
            />
          );
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
