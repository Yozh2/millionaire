import type { Campaign } from '../../../../types';

interface CampaignCardProps {
  campaign: Campaign;
  selected: boolean;
  onSelect: () => void;
  isLightTheme?: boolean;
  uniformWidthPx?: number;
}

export function CampaignCard({
  campaign,
  selected,
  onSelect,
  isLightTheme,
  uniformWidthPx,
}: CampaignCardProps) {
  const CampaignIcon = campaign.icon;

  return (
    <button
      onClick={onSelect}
      data-campaign-card="true"
      className={`flex-none flex flex-col items-center gap-2 p-3 md:p-4 border-4 transition-all transform hover:scale-105 h-[148px] ${
        isLightTheme ? 'bg-white/35' : 'bg-stone-950/50'
      }`}
      style={{
        width: uniformWidthPx ? `${uniformWidthPx}px` : undefined,
        maxWidth: '100%',
        borderStyle: 'ridge',
        borderColor: selected ? campaign.theme.glowColor : '#44403c',
        boxShadow: selected
          ? `0 0 25px ${campaign.theme.glow}, inset 0 0 15px ${campaign.theme.glow}`
          : 'none',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = campaign.theme.glowColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = '#44403c';
        }
      }}
    >
      <CampaignIcon />
      <span
        className="text-sm font-bold"
        style={{
          color: selected ? campaign.theme.glowColor : campaign.theme.glowSecondary,
        }}
      >
        {campaign.name}
      </span>
      <span className="text-xs text-stone-500">{campaign.label}</span>
    </button>
  );
}

export default CampaignCard;
