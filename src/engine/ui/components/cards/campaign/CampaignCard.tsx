import type { Campaign, CampaignIconProps } from '@engine/types';
import { baseImgIconClass, getCampaignIconSizeClass } from '@engine/types';
import { useRef, type CSSProperties } from 'react';
import { useCampaignCardFsm } from './useCampaignCardFsm';
import { gameIconsFile } from '@public';

const createEmojiSvgDataUrl = (emoji: string): string => {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
    `<text y='.9em' font-size='90'>${emoji}</text>` +
    '</svg>';
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const setImgEmojiFallback = (e: unknown, emoji: string): void => {
  const target = (e as any)?.currentTarget as HTMLImageElement | undefined;
  if (!target) return;
  if (target.dataset?.emojiFallbackApplied === 'true') return;
  target.dataset.emojiFallbackApplied = 'true';
  target.src = createEmojiSvgDataUrl(emoji);
};

interface CampaignCardProps {
  gameId: string;
  campaign: Campaign;
  selected: boolean;
  onSelect: () => void;
  isLightTheme?: boolean;
  style?: CSSProperties;
}

export function CampaignCard({
  gameId,
  campaign,
  selected,
  onSelect,
  isLightTheme,
  style,
}: CampaignCardProps) {
  const CampaignIcon =
    campaign.icon ??
    (({ className, size }: CampaignIconProps) => (
      <img
        src={gameIconsFile(gameId, `${campaign.id}.webp`)}
        alt={campaign.name}
        loading="lazy"
        draggable={false}
        className={`${baseImgIconClass} ${className ?? getCampaignIconSizeClass(size)}`}
        onError={(e) => setImgEmojiFallback(e, '🎯')}
      />
    ));
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const fsm = useCampaignCardFsm({
    ref: buttonRef,
    selected,
    onSelect,
  });
  const isMegatronCard = gameId === 'transformers' && campaign.id === 'megatron';
  const glowColor = isMegatronCard ? '#7c3aed' : campaign.theme.glowColor;
  const glowSecondary = isMegatronCard ? '#a78bfa' : campaign.theme.glowSecondary;
  const glow = isMegatronCard ? 'rgba(124, 58, 237, 0.5)' : campaign.theme.glow;

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
      className={`campaign-card relative flex-none overflow-hidden border-4 w-[170px] h-[215px] ${
        isLightTheme
          ? 'bg-gradient-to-b from-white/45 via-white/25 to-white/10'
          : 'bg-gradient-to-b from-stone-950/70 via-stone-950/45 to-black/70'
      }`}
      style={{
        ['--campaign-glow' as string]: glowColor,
        ['--campaign-glow-secondary' as string]: glowSecondary,
        borderStyle: 'ridge',
        borderColor: selected ? glowColor : '#44403c',
        boxShadow: selected
          ? `0 0 26px ${glow}, 0 16px 60px rgba(0,0,0,0.55), inset 0 0 14px ${glow}`
          : '0 14px 56px rgba(0,0,0,0.55)',
        ...(style ?? {}),
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = glowColor;
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
            color: selected ? glowColor : glowSecondary,
          }}
        >
          {campaign.name} 
        </span>
        <span
          className={`relative mt-2 w-full max-w-full px-0.5 text-xs text-center truncate leading-tight ${
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
