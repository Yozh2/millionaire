import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent, RefObject, ComponentType } from 'react';
import type { GameConfig, ThemeColors } from '@engine/types';
import { endScreenIconFrameClass } from '@engine/types';
import { ActionButton } from '../components/buttons';
import { Panel, PanelHeader } from '../components/panel';
import {
  DefaultCoinIcon,
  DefaultDefeatIcon,
  DefaultRetreatIcon,
  DefaultVictoryIcon,
} from '../icons/DefaultIcons';

export type ResultVariant = 'victory' | 'defeat' | 'retreat';

interface ResultPanelProps {
  config: GameConfig;
  theme: ThemeColors;
  variant: ResultVariant;
  wonPrize: string;
  iconRef?: RefObject<HTMLDivElement>;
  onNewGame: () => void;
  onActionButtonPress: (e?: PointerEvent<Element>) => void;
}

export function ResultPanel({
  config,
  theme,
  variant,
  wonPrize,
  iconRef,
  onNewGame,
  onActionButtonPress,
}: ResultPanelProps) {
  const resultTextRef = useRef<HTMLParagraphElement | null>(null);
  const [isTightLayout, setIsTightLayout] = useState(false);
  const CoinIcon = config.icons?.coin || DefaultCoinIcon;

  const IconElement = useMemo(() => {
    const pick = (
      custom: ComponentType | undefined,
      fallback: JSX.Element
    ): JSX.Element => {
      if (custom) {
        const Custom = custom;
        return <Custom />;
      }
      return fallback;
    };

    if (variant === 'victory') {
      return pick(config.endIcons?.victory, <DefaultVictoryIcon />);
    }
    if (variant === 'defeat') {
      return pick(config.endIcons?.defeat, <DefaultDefeatIcon />);
    }
    return pick(config.endIcons?.retreat, <DefaultRetreatIcon />);
  }, [config.endIcons, variant]);

  const text = useMemo(() => {
    if (variant === 'victory') return config.strings.victoryText;
    if (variant === 'defeat') return config.strings.defeatText;
    return config.strings.retreatText;
  }, [config.strings, variant]);

  const header = useMemo(() => {
    if (variant === 'victory') return config.strings.victoryHeader;
    if (variant === 'defeat') return config.strings.defeatHeader;
    return config.strings.retreatHeader;
  }, [config.strings, variant]);

  const titleColorClass =
    variant === 'victory'
      ? 'text-yellow-400'
      : variant === 'defeat'
        ? 'text-red-400'
        : theme.textPrimary;

  const titleTextShadow =
    variant === 'victory'
      ? '0 0 25px #facc15, 0 2px 8px #000'
      : variant === 'defeat'
        ? '0 0 25px #ef4444, 0 2px 8px #000'
        : `0 0 25px ${theme.glowColor}, 0 2px 8px #000`;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setIsTightLayout(media.matches);
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener?.(update);
    return () => media.removeListener?.(update);
  }, []);

  useLayoutEffect(() => {
    const textEl = resultTextRef.current;
    if (!textEl) return;

    if (!isTightLayout) {
      textEl.style.fontSize = '';
      return;
    }

    let rafId: number | null = null;
    let cancelled = false;

    const fit = () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;

        textEl.style.fontSize = '';

        const computed = window.getComputedStyle(textEl);
        const baseSize = Number.parseFloat(computed.fontSize);
        if (!Number.isFinite(baseSize) || baseSize <= 0) return;

        const getLineCount = () => {
          const lineHeight = Number.parseFloat(window.getComputedStyle(textEl).lineHeight);
          if (!Number.isFinite(lineHeight) || lineHeight <= 0) return 0;
          return Math.ceil(textEl.scrollHeight / lineHeight);
        };

        const maxLines = 2;
        const baseLines = getLineCount();
        if (baseLines <= maxLines) return;

        const minSize = Math.max(11, baseSize * 0.6);

        let low = minSize;
        let high = baseSize;
        let best = minSize;

        for (let i = 0; i < 8; i += 1) {
          const mid = (low + high) / 2;
          textEl.style.fontSize = `${mid.toFixed(2)}px`;
          const lines = getLineCount();
          if (lines <= maxLines) {
            best = mid;
            low = mid;
          } else {
            high = mid;
          }
        }

        textEl.style.fontSize = `${best.toFixed(2)}px`;
      });
    };

    fit();

    const ro = new ResizeObserver(() => fit());
    ro.observe(textEl);

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
  }, [text, isTightLayout]);

  return (
    <Panel className="p-1 animate-slide-in stagger-2">
      <PanelHeader>{header}</PanelHeader>
      <div className="text-center pt-6 pb-6 px-4 flex flex-col min-h-[28rem] sm:pt-10 sm:pb-8 sm:min-h-[36rem]">
        <div
          ref={iconRef}
          className={`animate-pop-in stagger-3 end-screen-icon ${endScreenIconFrameClass}`}
        >
          {IconElement}
        </div>

        <p
          ref={resultTextRef}
          className={`text-2xl font-bold mt-4 sm:mt-6 mb-3 sm:mb-4 tracking-wide animate-slide-in stagger-4 ${titleColorClass}`}
          style={{ textShadow: titleTextShadow }}
        >
          {text}
        </p>

        <div className="flex items-center justify-center gap-1 sm:gap-2 text-yellow-300 font-bold animate-prize stagger-5 max-w-full text-[clamp(0.85rem,4.4vw,1.25rem)] whitespace-nowrap">
          {CoinIcon && <CoinIcon />}
          <span>
            {wonPrize} {config.prizes.currency}
          </span>
        </div>

        <div className="mt-4 sm:mt-auto pt-2 sm:pt-8 animate-pop-in stagger-6">
          <ActionButton
            theme={theme}
            onClick={onNewGame}
            onPointerDown={(e) => onActionButtonPress(e)}
            className={`bg-gradient-to-b ${theme.bgButton} text-white ${theme.borderLight}`}
          >
            {config.strings.newGameButton}
          </ActionButton>
        </div>
      </div>
    </Panel>
  );
}

export default ResultPanel;
