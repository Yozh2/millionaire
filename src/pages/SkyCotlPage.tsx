/**
 * Sky: Children of the Light Game Page
 */

import { MillionaireGame } from '../engine';
import { skyCotlConfig } from '../games/sky-cotl';

export default function SkyCotlPage() {
  return <MillionaireGame config={skyCotlConfig} />;
}

