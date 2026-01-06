/**
 * Millionaire - Main App
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

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingScreen } from './screens/loading/LoadingScreen';
import RegisteredGamePage from '@pages/RegisteredGamePage';
import { getGameEntries } from './screens/registry';

const GAME_ENTRIES = getGameEntries();
const GameSelector = lazy(() => import('./screens/registry/GameSelectorScreen'));

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
