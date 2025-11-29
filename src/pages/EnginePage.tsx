/**
 * Engine Demo Page
 *
 * Minimal PoC of the quiz engine with no external assets.
 * Uses oscillator sounds only.
 */

import { MillionaireGame } from '../engine';
import { defaultConfig } from '../games/default';

export default function EnginePage() {
  return <MillionaireGame config={defaultConfig} />;
}
