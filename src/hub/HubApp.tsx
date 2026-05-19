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

import LoadingSandboxPage from '@hub/pages/LoadingSandboxPage';
import { GameSelectorScreen } from './catalog/GameSelectorScreen';
import { Routes, Route, Navigate } from 'react-router-dom';
import RegisteredGamePage from '@hub/pages/RegisteredGamePage';
import { getCatalogEntries } from './catalog';

const GAME_ENTRIES = getCatalogEntries();

/**
 * Main application component with routing.
 */
export default function HubApp() {
  const showDevRoutes = import.meta.env.DEV;

  return (
    <Routes>
      <Route path="/" element={<GameSelectorScreen />} />
      {GAME_ENTRIES.map((entry) => (
        <Route
          key={entry.id}
          path={entry.routePath}
          element={<RegisteredGamePage gameId={entry.id} />}
        />
      ))}
      {showDevRoutes && (
        <Route path="/sandbox/loading" element={<LoadingSandboxPage />} />
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
