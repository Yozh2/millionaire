/**
 * Baldur's Gate 3 Edition Page
 *
 * Full-featured quiz game with BG3 theming,
 * custom music, sounds, and voice lines.
 */

import { MillionaireGame } from '../engine';
import { bg3Config } from '../games/bg3';

export default function BG3Page() {
  return <MillionaireGame config={bg3Config} />;
}
