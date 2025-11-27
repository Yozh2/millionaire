/**
 * BG3 Millionaire - Quiz Game
 *
 * A "Who Wants to Be a Millionaire" style quiz game themed around
 * Baldur's Gate 3 and Forgotten Realms lore.
 *
 * This is the main entry point that uses the reusable quiz engine
 * with BG3-specific configuration.
 *
 * @author Yozh2
 * @see https://github.com/Yozh2/bg3-millionaire
 */

import { MillionaireGame } from './engine';
import { bg3Config } from './games/bg3';

/**
 * Main application component.
 * Uses the MillionaireGame engine with BG3 configuration.
 */
export default function App() {
  return <MillionaireGame config={bg3Config} />;
}
