import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { Campaign, GameConfig, ThemeColors } from '@engine/types';
import { ActionButton } from '../components/buttons';
import { Panel, PanelHeader } from '../components/panel';
import { CampaignCard } from '../components/cards/campaign/CampaignCard';

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

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
  const campaigns = config.campaigns;
  const firstRow = useMemo(() => campaigns.slice(0, 3), [campaigns]);
  const restRows = useMemo(() => campaigns.slice(3), [campaigns]);

  const firstRowWrapRef = useRef<HTMLDivElement | null>(null);
  const firstRowGroupRef = useRef<HTMLDivElement | null>(null);
  const introTextRef = useRef<HTMLParagraphElement | null>(null);
  const [firstRowScale, setFirstRowScale] = useState(1);
  const [firstRowAvailablePx, setFirstRowAvailablePx] = useState(0);

  useLayoutEffect(() => {
    const wrap = firstRowWrapRef.current;
    const group = firstRowGroupRef.current;
    if (!wrap || !group) return;

    let rafId: number | null = null;

    const fit = () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const available = wrap.clientWidth;
        const content = group.scrollWidth;
        if (available <= 0 || content <= 0) return;

        const next = clamp((available - 1) / content, 0.48, 1);
        setFirstRowScale((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
        setFirstRowAvailablePx(available);
      });
    };

    fit();

    const ro = new ResizeObserver(() => fit());
    ro.observe(wrap);

    return () => {
      ro.disconnect();
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [firstRow.length]);

  useLayoutEffect(() => {
    const text = introTextRef.current;
    if (!text) return;

    let rafId: number | null = null;
    let cancelled = false;

    const fit = () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;

        text.style.fontSize = '';

        const computed = window.getComputedStyle(text);
        const baseSize = Number.parseFloat(computed.fontSize);
        if (!Number.isFinite(baseSize) || baseSize <= 0) return;

        const getLineCount = () => {
          const lineHeight = Number.parseFloat(window.getComputedStyle(text).lineHeight);
          if (!Number.isFinite(lineHeight) || lineHeight <= 0) return 0;
          return Math.ceil(text.scrollHeight / lineHeight);
        };

        const maxLines = 3;
        const baseLines = getLineCount();
        if (baseLines <= maxLines) return;

        const minSize = Math.max(10, baseSize * 0.7);

        let low = minSize;
        let high = baseSize;
        let best = minSize;

        for (let i = 0; i < 8; i += 1) {
          const mid = (low + high) / 2;
          text.style.fontSize = `${mid.toFixed(2)}px`;
          const lines = getLineCount();
          if (lines <= maxLines) {
            best = mid;
            low = mid;
          } else {
            high = mid;
          }
        }

        text.style.fontSize = `${best.toFixed(2)}px`;
      });
    };

    fit();

    const ro = new ResizeObserver(() => fit());
    ro.observe(text);

    const fonts = (document as any)?.fonts as FontFaceSet | undefined;
    if (fonts?.ready) {
      fonts.ready.then(() => {
        if (cancelled) return;
        fit();
      });
    }

    return () => {
      cancelled = true;
      ro.disconnect();
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [config.strings.introText]);

  const selectedId = selectedCampaign?.id ?? null;
  const selectedFirstRowIndex = useMemo(
    () => (selectedId ? firstRow.findIndex((c) => c.id === selectedId) : -1),
    [firstRow, selectedId],
  );

  const isTight = firstRowScale < 0.999;
  const tightness = clamp((1 - firstRowScale) / 0.52, 0, 1);
  const focusMode = isTight && selectedFirstRowIndex >= 0;

  return (
    <Panel className="p-1 animate-slide-in stagger-2">
      <PanelHeader>{config.strings.selectPath}</PanelHeader>
      <div className="text-center py-6 sm:py-8 px-4">
        <p
          ref={introTextRef}
          className={`${theme.textSecondary} text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed whitespace-pre-line`}
        >
          {config.strings.introText}
        </p>

        {/* Campaign Selection */}
        <div className={isTight ? 'mb-4 sm:mb-6' : 'mb-6 sm:mb-8'}>
          <div
            className={`flex flex-col items-center ${
              isTight ? 'gap-3 sm:gap-5' : 'gap-4 sm:gap-6'
            }`}
          >
            <div ref={firstRowWrapRef} className="w-full flex justify-center overflow-visible">
              <div
                ref={firstRowGroupRef}
                className="inline-flex justify-center gap-3 sm:gap-4 md:gap-6"
                data-campaign-row-scaled={isTight ? 'true' : 'false'}
                style={{
                  transform: `scale(${firstRowScale.toFixed(4)})`,
                  transformOrigin: 'top center',
                }}
              >
                {firstRow.map((campaign, index) => {
                  const selected = selectedId === campaign.id;

                  let vars: CSSProperties | undefined;
                  if (focusMode && selected) {
                    // Make the selected card "fly towards the viewer" on tight screens.
                    // Keep other cards in place (no shifting/no group rescale on select).
                    const baseCardWidthPx = 170;
                    const maxOverallScale =
                      firstRowAvailablePx > 0
                        ? clamp((firstRowAvailablePx * 0.96) / baseCardWidthPx, 1.12, 2.4)
                        : 2.4;

                    // Tuned for common mobile viewports (360x800, 390x844):
                    // keep pop very subtle (just a quick "peek" without leaving the row).
                    const targetOverallScale = 1.09 + tightness * 0.11;
                    const overallScale = Math.min(targetOverallScale, maxOverallScale);

                    const popScale = clamp(overallScale / firstRowScale, 1.04, 1.6);
                    // Keep below perspective(900px) to avoid projection flip.
                    const popZ = clamp(35 + (overallScale - 1) * 90, 35, 140);

                    vars = {
                      ['--campaign-shiftX' as any]: '0px',
                      ['--campaign-z' as any]: `${popZ.toFixed(1)}px`,
                      ['--campaign-focusScale' as any]: `${popScale.toFixed(3)}`,
                    } satisfies CSSProperties;
                  }

                  return (
                    <CampaignCard
                      key={campaign.id}
                      gameId={config.id}
                      campaign={campaign}
                      selected={selected}
                      isLightTheme={isLightTheme}
                      onSelect={() => onSelectCampaign(campaign)}
                      style={vars}
                    />
                  );
                })}
              </div>
            </div>

            {restRows.length > 0 && (
              <div className="w-full flex justify-center">
                <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap">
                  {restRows.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      gameId={config.id}
                      campaign={campaign}
                      selected={selectedId === campaign.id}
                      isLightTheme={isLightTheme}
                      onSelect={() => onSelectCampaign(campaign)}
                    />
                  ))}
                </div>
              </div>
            )}
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
