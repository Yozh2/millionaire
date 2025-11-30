/**
 * PoC Demo Page
 *
 * Minimal Proof of Concept of the quiz engine with no external assets.
 * Uses oscillator sounds only.
 */

import { MillionaireGame } from '../engine';
import { pocConfig } from '../games/poc';

export default function PocPage() {
  return <MillionaireGame config={pocConfig} />;
}
