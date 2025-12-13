import type { Campaign } from '../../../../types';

interface CampaignCardProps {
  campaign: Campaign;
  selected: boolean;
  onSelect: () => void;
  isLightTheme?: boolean;
}

export function CampaignCard({
  campaign,
  selected,
  onSelect,
  isLightTheme,
}: CampaignCardProps) {
  const CampaignIcon = campaign.icon;

  return (
    <button
      onClick={onSelect}
      data-campaign-card="true"
      data-selected={selected ? 'true' : 'false'}
      className={`campaign-card relative flex-none overflow-hidden border-4 transition-transform duration-200 transform hover:scale-[1.03] w-[164px] h-[216px] px-3 pt-7 pb-3 flex flex-col items-center ${
        isLightTheme
          ? 'bg-gradient-to-b from-white/45 via-white/25 to-white/10'
          : 'bg-gradient-to-b from-stone-950/70 via-stone-950/45 to-black/70'
      } ${selected ? '-translate-y-1' : ''}`}
      style={{
        ['--campaign-glow' as string]: campaign.theme.glowColor,
        ['--campaign-glow-secondary' as string]: campaign.theme.glowSecondary,
        borderStyle: 'ridge',
        borderColor: selected ? campaign.theme.glowColor : '#44403c',
        boxShadow: selected
          ? `0 0 26px ${campaign.theme.glow}, 0 16px 60px rgba(0,0,0,0.55), inset 0 0 14px ${campaign.theme.glow}`
          : '0 14px 56px rgba(0,0,0,0.55)',
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
      <div className="campaign-card-inner relative w-full h-full flex flex-col items-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/35"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-2 border ${
            isLightTheme ? 'border-black/10' : 'border-white/10'
          }`}
        />

        <div className="relative mt-0 w-[98px] h-[98px] flex items-center justify-center overflow-visible">
          <div aria-hidden="true" className="campaign-icon-glow" />
          <div aria-hidden="true" className="campaign-icon-rays" />
          <CampaignIcon className="relative z-10 w-full h-full max-w-full max-h-full object-contain text-5xl leading-none" />
        </div>

        <span
          className="relative mt-5 w-full max-w-full px-0.5 text-sm font-bold text-center truncate leading-tight"
          style={{
            color: selected ? campaign.theme.glowColor : campaign.theme.glowSecondary,
          }}
        >
          {campaign.name}
        </span>
        <span
          className={`relative mt-0 w-full max-w-full px-0.5 text-xs text-center truncate leading-tight ${
            isLightTheme ? 'text-stone-600' : 'text-stone-400'
          }`}
        >
          {campaign.label}
        </span>
      </div>
    </button>
  );
}

export default CampaignCard;
