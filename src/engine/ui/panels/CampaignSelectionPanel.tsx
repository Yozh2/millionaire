import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { Campaign, GameConfig, ThemeColors } from '@engine/types';
import { ActionButton } from '@engine/ui/components/buttons';
import { Panel, PanelHeader } from '@engine/ui/components/panel';
import { CampaignCard } from '@engine/ui/components/cards/campaign/CampaignCard';

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
  const cardBlockRef = useRef<HTMLDivElement | null>(null);
  const introTextRef = useRef<HTMLParagraphElement | null>(null);
  const [firstRowScale, setFirstRowScale] = useState(1);
  const [firstRowAvailablePx, setFirstRowAvailablePx] = useState(0);
  const [tightRowHeight, setTightRowHeight] = useState<number | null>(null);
  const [nameScale, setNameScale] = useState(1);
  const [labelScale, setLabelScale] = useState(1);
  const isTight = firstRowScale < 0.999;

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
    if (!isTight) {
      setTightRowHeight(null);
      return;
    }

    const wrap = firstRowWrapRef.current;
    if (!wrap) return;

    let rafId: number | null = null;

    const update = () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const baseHeight = wrap.offsetHeight;
        if (!baseHeight) return;
        const next = Math.round(baseHeight * firstRowScale);
        setTightRowHeight((prev) => (prev === next ? prev : next));
      });
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(wrap);

    return () => {
      ro.disconnect();
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, [firstRowScale, isTight]);

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

  useLayoutEffect(() => {
    const block = cardBlockRef.current;
    if (!block) return;

    let rafId: number | null = null;
    let cancelled = false;

    const computeScale = (selector: string) => {
      const elements = Array.from(block.querySelectorAll<HTMLElement>(selector));
      if (elements.length === 0) return 1;

      let nextScale = 1;
      for (const el of elements) {
        const available = el.clientWidth;
        const needed = el.scrollWidth;
        if (available <= 0 || needed <= 0) continue;
        if (needed > available) {
          nextScale = Math.min(nextScale, available / needed);
        }
      }

      return clamp(nextScale, 0.68, 1);
    };

    const fit = () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        if (cancelled) return;
        const nextNameScale = computeScale('[data-campaign-name]');
        const nextLabelScale = computeScale('[data-campaign-label]');
        setNameScale((prev) => (Math.abs(prev - nextNameScale) < 0.003 ? prev : nextNameScale));
        setLabelScale((prev) => (Math.abs(prev - nextLabelScale) < 0.003 ? prev : nextLabelScale));
      });
    };

    fit();

    const ro = new ResizeObserver(() => fit());
    ro.observe(block);

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
  }, [campaigns]);

  const selectedId = selectedCampaign?.id ?? null;
  const selectedFirstRowIndex = useMemo(
    () => (selectedId ? firstRow.findIndex((c) => c.id === selectedId) : -1),
    [firstRow, selectedId],
  );

  const tightness = clamp((1 - firstRowScale) / 0.52, 0, 1);
  const focusMode = isTight && selectedFirstRowIndex >= 0;
  const focusPop = useMemo(() => {
    if (!isTight || firstRowScale <= 0) return { scale: 1, z: 0 };

    const baseCardWidthPx = 170;
    const maxOverallScale =
      firstRowAvailablePx > 0
        ? clamp((firstRowAvailablePx * 0.96) / baseCardWidthPx, 1.12, 2.4)
        : 2.4;

    const targetOverallScale = 1.09 + tightness * 0.11;
    const overallScale = Math.min(targetOverallScale, maxOverallScale);

    const popScale = clamp(overallScale / firstRowScale, 1.04, 1.6);
    const popZ = clamp(35 + (overallScale - 1) * 90, 35, 140);

    return { scale: popScale, z: popZ };
  }, [firstRowAvailablePx, firstRowScale, isTight, tightness]);

  const rowScaleForHeight = isTight ? focusPop.scale : 1;
  const baseCardGapPx = 14;
  const cardFloatGuardPx = isTight ? 14 : 10;
  const cardGuardPx = baseCardGapPx + cardFloatGuardPx;
  const cardBlockStyle: CSSProperties = {
    paddingTop: `${cardGuardPx}px`,
    paddingBottom: `${cardGuardPx}px`,
    ['--campaign-name-scale' as string]: nameScale.toFixed(3),
    ['--campaign-label-scale' as string]: labelScale.toFixed(3),
  };

  if (isTight && restRows.length === 0 && tightRowHeight) {
    cardBlockStyle.height = `${Math.round(tightRowHeight * rowScaleForHeight)}px`;
  }

  return (
    <Panel className="p-1 animate-slide-in stagger-2">
      <PanelHeader>{config.strings.selectPath}</PanelHeader>
      <div className="text-center py-5 sm:py-7 px-4">
        <p
          ref={introTextRef}
          className={`${theme.textSecondary} text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed whitespace-pre-line`}
        >
          {config.strings.introText}
        </p>

        {/* Campaign Selection */}
        <div ref={cardBlockRef} className="mb-4 sm:mb-6" style={cardBlockStyle}>
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
                    vars = {
                      ['--campaign-shiftX' as any]: '0px',
                      ['--campaign-z' as any]: `${focusPop.z.toFixed(1)}px`,
                      ['--campaign-focusScale' as any]: `${focusPop.scale.toFixed(3)}`,
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
