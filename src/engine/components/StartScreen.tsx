/**
 * StartScreen - Campaign selection and game start screen
 */

import type { PointerEvent } from 'react';
import { GameConfig, Campaign, ThemeColors } from '../types';
import { Panel, PanelHeader } from './ui';
import { HeaderPanel } from './HeaderPanel';

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
      <Panel className="p-1 animate-slide-in stagger-2">
        <PanelHeader>{config.strings.selectPath}</PanelHeader>
        <div className="text-center py-8 px-4">
          <p className="text-amber-200 text-base mb-6 max-w-md mx-auto leading-relaxed">
            {config.strings.introText}
          </p>

          {/* Mode Selection */}
          <div className="mb-8">
            <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
              {config.campaigns.map((campaign) => {
                const isSelected = selectedCampaign?.id === campaign.id;
                const CampaignIcon = campaign.icon;

                return (
                  <button
                    key={campaign.id}
                    onClick={() => onSelectCampaign(campaign)}
                    className="flex flex-col items-center gap-2 p-3 md:p-4 border-4 transition-all transform hover:scale-105 bg-stone-950/50"
                    style={{
                      borderStyle: 'ridge',
                      borderColor: isSelected ? campaign.theme.glowColor : '#44403c',
                      boxShadow: isSelected
                        ? `0 0 25px ${campaign.theme.glow}, inset 0 0 15px ${campaign.theme.glow}`
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = campaign.theme.glowColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#44403c';
                      }
                    }}
                  >
                    <CampaignIcon />
                    <span
                      className="text-sm font-bold"
                      style={{ color: isSelected ? campaign.theme.glowColor : campaign.theme.glowSecondary }}
                    >
                      {campaign.name}
                    </span>
                    <span className="text-xs text-stone-500">
                      {campaign.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={onStartGame}
            onPointerDown={(e) => selectedCampaign && onBigButtonPress(e)}
            disabled={!selectedCampaign}
            className={`action-btn px-8 py-3 font-bold text-lg tracking-wide border-4 ${
              selectedCampaign
                ? `bg-gradient-to-b ${theme.bgButton} text-white ${theme.borderLight}`
                : 'bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900 text-stone-500 border-stone-600 cursor-not-allowed'
            }`}
            style={{
              ['--btn-glow' as string]: theme.glow,
              boxShadow: selectedCampaign
                ? `0 5px 20px rgba(0, 0, 0, 0.3), 0 0 25px ${theme.glow}`
                : 'none',
              borderStyle: 'ridge',
              textShadow: selectedCampaign ? '0 2px 4px rgba(0,0,0,0.8)' : 'none',
            }}
          >
            {config.strings.startButton}
          </button>
        </div>
      </Panel>
    </div>
  );
}

export default StartScreen;
