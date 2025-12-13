import { useLayoutEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { Campaign, GameConfig, ThemeColors } from '../../types';
import { Panel, PanelHeader } from '../components/panel';
import { CampaignCard } from '../components/cards/campaign/CampaignCard';

interface CampaignSelectionPanelProps {
  config: GameConfig;
  selectedCampaign: Campaign | null;
  onSelectCampaign: (campaign: Campaign) => void;
  onStartGame: () => void;
  onBigButtonPress: (e?: PointerEvent<Element>) => void;
  theme: ThemeColors;
}

export function CampaignSelectionPanel({
  config,
  selectedCampaign,
  onSelectCampaign,
  onStartGame,
  onBigButtonPress,
  theme,
}: CampaignSelectionPanelProps) {
  const isLightTheme = !!theme.isLight;
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const [uniformCardWidthPx, setUniformCardWidthPx] = useState<number>();

  useLayoutEffect(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    let raf = 0;

    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cards = Array.from(
          container.querySelectorAll<HTMLButtonElement>('[data-campaign-card="true"]')
        );
        if (cards.length === 0) return;

        const maxWidth = Math.max(
          ...cards.map((card) => card.getBoundingClientRect().width)
        );
        const containerWidth = container.getBoundingClientRect().width;
        const nextWidth = Math.min(maxWidth, containerWidth);

        setUniformCardWidthPx((prev) =>
          prev !== undefined && Math.abs(prev - nextWidth) < 0.5 ? prev : nextWidth
        );
      });
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', measure);
      };
    }

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    for (const card of container.querySelectorAll('[data-campaign-card="true"]')) {
      ro.observe(card);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [config.campaigns.length, theme.isLight]);

  return (
    <Panel className="p-1 animate-slide-in stagger-2">
      <PanelHeader>{config.strings.selectPath}</PanelHeader>
      <div className="text-center py-8 px-4">
        <p
          className={`${theme.textSecondary} text-base mb-6 max-w-md mx-auto leading-relaxed`}
        >
          {config.strings.introText}
        </p>

        {/* Campaign Selection */}
        <div className="mb-8">
          <div ref={cardsContainerRef} className="flex justify-center gap-4 md:gap-6 flex-wrap">
            {config.campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                selected={selectedCampaign?.id === campaign.id}
                isLightTheme={isLightTheme}
                uniformWidthPx={uniformCardWidthPx}
                onSelect={() => onSelectCampaign(campaign)}
              />
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartGame}
          onPointerDown={(e) => selectedCampaign && onBigButtonPress(e)}
          disabled={!selectedCampaign}
          className={`glare action-btn px-8 py-3 font-bold text-lg tracking-wide border-4 ${
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
  );
}

export default CampaignSelectionPanel;
