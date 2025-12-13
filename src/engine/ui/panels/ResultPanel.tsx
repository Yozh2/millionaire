import { useMemo } from 'react';
import type { PointerEvent, RefObject, ComponentType } from 'react';
import type { GameConfig, ThemeColors } from '../../types';
import { Panel, PanelHeader } from '../components/panel';
import {
  DefaultCoinIcon,
  DefaultFailIcon,
  DefaultMoneyIcon,
  DefaultTrophyIcon,
} from '../icons/DefaultIcons';

export type ResultVariant = 'won' | 'lost' | 'took_money';

interface ResultPanelProps {
  config: GameConfig;
  theme: ThemeColors;
  variant: ResultVariant;
  wonPrize: string;
  iconRef?: RefObject<HTMLDivElement>;
  onNewGame: () => void;
  onBigButtonPress: (e?: PointerEvent<Element>) => void;
}

export function ResultPanel({
  config,
  theme,
  variant,
  wonPrize,
  iconRef,
  onNewGame,
  onBigButtonPress,
}: ResultPanelProps) {
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

    if (variant === 'won') {
      return pick(config.endIcons?.won, <DefaultTrophyIcon />);
    }
    if (variant === 'lost') {
      return pick(config.endIcons?.lost, <DefaultFailIcon />);
    }
    return pick(config.endIcons?.tookMoney, <DefaultMoneyIcon />);
  }, [config.endIcons, variant]);

  const title = useMemo(() => {
    if (variant === 'won') return config.strings.wonTitle;
    if (variant === 'lost') return config.strings.lostTitle;
    return config.strings.tookMoneyTitle;
  }, [config.strings, variant]);

  const text = useMemo(() => {
    if (variant === 'won') return config.strings.wonText;
    if (variant === 'lost') return config.strings.lostText;
    return config.strings.tookMoneyText;
  }, [config.strings, variant]);

  const header = useMemo(() => {
    if (variant === 'won') return config.strings.wonHeader;
    if (variant === 'lost') return config.strings.lostHeader;
    return config.strings.tookMoneyHeader;
  }, [config.strings, variant]);

  const titleColorClass =
    variant === 'won'
      ? 'text-yellow-400'
      : variant === 'lost'
        ? 'text-red-400'
        : theme.textPrimary;

  const titleTextShadow =
    variant === 'won'
      ? '0 0 25px #facc15, 0 2px 8px #000'
      : variant === 'lost'
        ? '0 0 25px #ef4444, 0 2px 8px #000'
        : `0 0 25px ${theme.glowColor}, 0 2px 8px #000`;

  return (
    <Panel className="p-1 animate-slide-in stagger-2">
      <PanelHeader>{header}</PanelHeader>
      <div className="text-center py-12 px-4">
        <div ref={iconRef} className="animate-pop-in stagger-3">
          {IconElement}
        </div>

        <h2
          className={`text-2xl font-bold mt-4 mb-4 tracking-wide animate-slide-in stagger-4 ${titleColorClass}`}
          style={{ textShadow: titleTextShadow }}
        >
          {title}
        </h2>

        <p className={`${theme.textSecondary} text-lg mb-2`}>{text}</p>

        <div className="flex items-center justify-center gap-2 text-xl text-yellow-300 font-bold mb-6 animate-prize stagger-5">
          {CoinIcon && <CoinIcon />}
          <span>
            {wonPrize} {config.prizes.currency}
          </span>
        </div>

        <div className="animate-pop-in stagger-6">
          <button
            onClick={onNewGame}
            onPointerDown={(e) => onBigButtonPress(e)}
            className={`glare action-btn px-8 py-3 bg-gradient-to-b ${theme.bgButton} text-white font-bold text-lg tracking-wide border-4 ${theme.borderLight}`}
            style={{
              ['--btn-glow' as string]: theme.glow,
              boxShadow: `0 5px 20px rgba(0, 0, 0, 0.3), 0 0 25px ${theme.glow}`,
              borderStyle: 'ridge',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {config.strings.newGameButton}
          </button>
        </div>
      </div>
    </Panel>
  );
}

export default ResultPanel;
