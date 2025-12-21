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
      <div className="text-center py-8 px-4">
        <p
          className={`${theme.textSecondary} text-base mb-6 max-w-md mx-auto leading-relaxed whitespace-pre-line`}
        >
          {config.strings.introText}
        </p>

        {/* Campaign Selection */}
        <div className="mb-8">
          <div className="flex flex-col items-center gap-6">
            <div ref={firstRowWrapRef} className="w-full flex justify-center overflow-visible">
              <div
                ref={firstRowGroupRef}
                className="inline-flex justify-center gap-4 md:gap-6"
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
                    // keep pop subtle, just enough to read the card.
                    const targetOverallScale = 1.18 + tightness * 0.22;
                    const overallScale = Math.min(targetOverallScale, maxOverallScale);

                    const popScale = clamp(overallScale / firstRowScale, 1.08, 2.0);
                    // Keep below perspective(900px) to avoid projection flip.
                    const popZ = clamp(70 + (overallScale - 1) * 130, 70, 280);

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
                <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
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
