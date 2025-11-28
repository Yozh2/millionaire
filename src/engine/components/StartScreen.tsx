/**
 * StartScreen - Campaign selection and game start screen
 */

import { GameConfig, Campaign, ThemeColors } from '../types';
import { Panel, PanelHeader } from '../../components/ui';

interface StartScreenProps {
  config: GameConfig;
  selectedCampaign: Campaign | null;
  onSelectCampaign: (campaign: Campaign) => void;
  onStartGame: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  theme: ThemeColors;
}

export function StartScreen({
  config,
  selectedCampaign,
  onSelectCampaign,
  onStartGame,
  isMusicPlaying,
  onToggleMusic,
  theme,
}: StartScreenProps) {
  return (
    <>
      {/* Header */}
      <Panel className="mb-4 p-1">
        <PanelHeader>{config.strings.headerTitle}</PanelHeader>
        <div className="p-4 text-center">
          {/* Music Toggle */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onToggleMusic}
              className="text-2xl hover:scale-110 transition-transform"
              title={isMusicPlaying ? config.strings.musicOn : config.strings.musicOff}
            >
              {isMusicPlaying ? '🔊' : '🔇'}
            </button>
          </div>

          {/* Title */}
          <h1
            className={`text-2xl md:text-3xl font-bold tracking-wider mb-1 transition-colors duration-500 ${theme.textPrimary}`}
            style={{
              textShadow: `0 0 15px ${theme.glowColor}, 0 0 30px ${theme.glowSecondary}, 2px 2px 4px #000`,
              fontFamily: 'Georgia, serif',
            }}
          >
            {config.title}
          </h1>
          <h2
            className={`text-lg tracking-wide transition-colors duration-500 ${theme.textPrimary}`}
            style={{
              lineHeight: '1.5',
              fontFamily: 'Arial, sans-serif',
              fontStyle: 'italic',
            }}
          >
            {config.subtitle}
          </h2>
        </div>
      </Panel>

      {/* Campaign Selection Panel */}
      <Panel className="p-1">
        <PanelHeader>{config.strings.selectPath}</PanelHeader>
        <div className="text-center py-8 px-4">
          <p className="text-amber-200 text-base mb-6 max-w-md mx-auto leading-relaxed font-serif">
            {config.strings.introText}
          </p>

          {/* Mode Selection */}
          <div className="mb-8">
            <p className="text-amber-400 text-sm mb-4 font-serif tracking-wide">
              {config.strings.selectPath}
            </p>
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
                      className="text-sm font-serif font-bold"
                      style={{ color: isSelected ? campaign.theme.glowColor : campaign.theme.glowSecondary }}
                    >
                      {campaign.name}
                    </span>
                    <span className="text-xs text-stone-500 font-serif">
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
            disabled={!selectedCampaign}
            className={`px-8 py-3 font-bold text-lg tracking-wide border-4 transition-all transform font-serif ${
              selectedCampaign
                ? `bg-gradient-to-b ${theme.bgButton} text-white ${theme.borderLight} ${theme.bgButtonHover} hover:scale-105`
                : 'bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900 text-stone-500 border-stone-600 cursor-not-allowed'
            }`}
            style={{
              boxShadow: selectedCampaign
                ? `0 0 25px ${theme.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                : 'none',
              borderStyle: 'ridge',
              textShadow: selectedCampaign ? '0 2px 4px rgba(0,0,0,0.8)' : 'none',
            }}
          >
            {config.strings.startButton}
          </button>
        </div>
      </Panel>
    </>
  );
}

export default StartScreen;
