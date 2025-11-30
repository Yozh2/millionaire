/**
 * Transformers Game Page
 *
 * IDW Comics Edition - Megatron: Origin & Autocracy
 */

import { MillionaireGame } from '../engine';
import { transformersConfig } from '../games/transformers';

export default function TransformersPage() {
  return <MillionaireGame config={transformersConfig} />;
}
