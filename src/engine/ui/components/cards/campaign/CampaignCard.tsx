import type { Campaign } from '../../../../types';
import { useRef } from 'react';
import { useCampaignCardFsm } from './useCampaignCardFsm';

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
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const fsm = useCampaignCardFsm({
    ref: buttonRef,
    selected,
    onSelect,
  });

  return (
    <button
      ref={buttonRef}
      onClick={(e) => {
        if (fsm.suppressNextClickRef.current) {
          fsm.suppressNextClickRef.current = false;
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (selected) return;
        onSelect();
      }}
      {...fsm.eventHandlers}
      data-campaign-card="true"
      data-selected={selected ? 'true' : 'false'}
      data-card-state={fsm.state}
      className={`campaign-card relative flex-none overflow-hidden border-4 w-[164px] h-[216px] ${
        isLightTheme
          ? 'bg-gradient-to-b from-white/45 via-white/25 to-white/10'
          : 'bg-gradient-to-b from-stone-950/70 via-stone-950/45 to-black/70'
      }`}
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
      <div
        aria-hidden="true"
        className="campaign-card-glass pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/35"
      />
      <div
        aria-hidden="true"
        className="campaign-card-glass pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="campaign-card-glare pointer-events-none absolute"
      />
      <div
        aria-hidden="true"
        className={`campaign-card-frame pointer-events-none absolute inset-2 border ${
          isLightTheme ? 'border-black/10' : 'border-white/10'
        }`}
      />

      <div className="relative w-full h-full px-3 pt-7 pb-3 flex flex-col items-center">
        <div className="relative mt-0 w-[98px] h-[98px] flex items-center justify-center overflow-visible">
          <div aria-hidden="true" className="campaign-icon-glow" />
          <div aria-hidden="true" className="campaign-icon-rays-wrap">
            <div aria-hidden="true" className="campaign-icon-rays" />
          </div>
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
