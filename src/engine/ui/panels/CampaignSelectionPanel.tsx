import type { PointerEvent } from 'react';
import type { Campaign, GameConfig, ThemeColors } from '@engine/types';
import { ActionButton } from '../components/buttons';
import { Panel, PanelHeader } from '../components/panel';
import { CampaignCard } from '../components/cards/campaign/CampaignCard';

interface CampaignSelectionPanelProps {
  config: GameConfig;
  selectedCampaign: Campaign | null;
  onSelectCampaign: (campaign: Campaign) => void;
  onStartGame: () => void;
  onActionButtonPress: (e?: PointerEvent<Element>) => void;
  theme: ThemeColors;
}

export function CampaignSelectionPanel({
  config,
  selectedCampaign,
  onSelectCampaign,
  onStartGame,
  onActionButtonPress,
  theme,
}: CampaignSelectionPanelProps) {
  const isLightTheme = !!theme.isLight;

  return (
    <Panel className="p-1 animate-slide-in stagger-2">
      <PanelHeader>{config.strings.selectPath}</PanelHeader>
      <div className="text-center py-8 px-4">
        <p
          className={`${theme.textSecondary} text-base mb-6 max-w-md mx-auto leading-relaxed whitespace-pre-line`}
        >
          {config.strings.introText}
        </p>

        {/* Campaign Selection */}
        <div className="mb-8">
          <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
            {config.campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                gameId={config.id}
                campaign={campaign}
                selected={selectedCampaign?.id === campaign.id}
                isLightTheme={isLightTheme}
                onSelect={() => onSelectCampaign(campaign)}
              />
            ))}
          </div>
        </div>

        {/* Start Button */}
        <ActionButton
          theme={theme}
          onClick={onStartGame}
          onPointerDown={(e) => selectedCampaign && onActionButtonPress(e)}
          disabled={!selectedCampaign}
          className={
            selectedCampaign
              ? `bg-gradient-to-b ${theme.bgButton} text-white ${theme.borderLight}`
              : 'bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900 text-stone-500 border-stone-600 cursor-not-allowed'
          }
        >
          {config.strings.startButton}
        </ActionButton>
      </div>
    </Panel>
  );
}

export default CampaignSelectionPanel;
