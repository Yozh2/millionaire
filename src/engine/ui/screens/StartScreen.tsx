/**
 * StartScreen - Campaign selection and game start screen
 */

import type { PointerEvent } from 'react';
import { GameConfig, Campaign, ThemeColors } from '../../types';
import { HeaderPanel } from '../layout/header/HeaderPanel';
import { CampaignSelectionPanel } from '../panels/CampaignSelectionPanel';

interface StartScreenProps {
  config: GameConfig;
  selectedCampaign: Campaign | null;
  onSelectCampaign: (campaign: Campaign) => void;
  onStartGame: () => void;
  onBigButtonPress: (e?: PointerEvent<Element>) => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  theme: ThemeColors;
}

export function StartScreen({
  config,
  selectedCampaign,
  onSelectCampaign,
  onStartGame,
  onBigButtonPress,
  isMusicPlaying,
  onToggleMusic,
  theme,
}: StartScreenProps) {
  return (
    <div className="screen-transition">
      {/* Header */}
      <HeaderPanel
        config={config}
        theme={theme}
        slideshowScreen="start"
        campaignId={selectedCampaign?.id}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={onToggleMusic}
      />

      {/* Campaign Selection Panel */}
      <CampaignSelectionPanel
        config={config}
        selectedCampaign={selectedCampaign}
        onSelectCampaign={onSelectCampaign}
        onStartGame={onStartGame}
        onBigButtonPress={onBigButtonPress}
        theme={theme}
      />
    </div>
  );
}

export default StartScreen;
