/**
 * Millionaire Quiz Engine - Main App
 *
 * A "Who Wants to Be a Millionaire" style quiz game engine
 * supporting multiple themed games.
 *
 * Routes:
 * - /         → Game selector
 * - /engine   → Engine PoC (no external assets)
 * - /bg3      → Baldur's Gate 3 Edition
 * - /transformers → Transformers Edition (coming soon)
 *
 * @author Yozh2
 * @see https://github.com/Yozh2/millionaire
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GameSelector } from './components/GameSelector';

// Lazy load game configs for code splitting
const EngineGame = lazy(() => import('./pages/EnginePage'));
const BG3Game = lazy(() => import('./pages/BG3Page'));

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
        <Route path="/engine" element={<EngineGame />} />
        <Route path="/bg3" element={<BG3Game />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
