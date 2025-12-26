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
 *
 * @author Yozh2
 * @see https://github.com/Yozh2/millionaire
 */

import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingScreen } from '@app/components/LoadingScreen';
import { GameSelector } from './app/components/GameSelector';
import { getGameEntries, getPageEntries } from './app/registry';

const GAME_ENTRIES = getGameEntries();
const PAGE_ENTRIES = getPageEntries();

const LAZY_PAGES: Record<string, LazyExoticComponent<ComponentType>> =
  Object.fromEntries(PAGE_ENTRIES.map((entry) => [entry.id, lazy(entry.getComponent)]));
const RegisteredGamePage = lazy(() => import('./pages/RegisteredGamePage'));

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
