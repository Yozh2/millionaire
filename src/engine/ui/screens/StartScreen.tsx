/**
 * StartScreen - Campaign selection and game start screen
 */

import type { PointerEvent } from 'react';
import { GameConfig, Campaign, ThemeColors } from '../../types';
import { CampaignSelectionPanel } from '../panels/CampaignSelectionPanel';

interface StartScreenProps {
  config: GameConfig;
  selectedCampaign: Campaign | null;
  onSelectCampaign: (campaign: Campaign) => void;
  onStartGame: () => void;
  onBigButtonPress: (e?: PointerEvent<Element>) => void;
  theme: ThemeColors;
}

export function StartScreen({
  config,
  selectedCampaign,
  onSelectCampaign,
  onStartGame,
  onBigButtonPress,
  theme,
}: StartScreenProps) {
  return (
    <CampaignSelectionPanel
      config={config}
      selectedCampaign={selectedCampaign}
      onSelectCampaign={onSelectCampaign}
      onStartGame={onStartGame}
      onBigButtonPress={onBigButtonPress}
      theme={theme}
    />
  );
}

export default StartScreen;
