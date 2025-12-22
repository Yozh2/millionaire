import { useMemo } from 'react';
import type { PointerEvent, RefObject, ComponentType } from 'react';
import type { GameConfig, ThemeColors } from '@engine/types';
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

  return (
    <Panel className="p-1 animate-slide-in stagger-2">
      <PanelHeader>{header}</PanelHeader>
      <div className="text-center py-12 px-4">
        <div ref={iconRef} className="animate-pop-in stagger-3">
          {IconElement}
        </div>

        <p
          className={`text-2xl font-bold mt-8 mb-4 tracking-wide animate-slide-in stagger-4 ${titleColorClass}`}
          style={{ textShadow: titleTextShadow }}
        >
          {text}
        </p>

        <div className="flex items-center justify-center gap-2 text-xl text-yellow-300 font-bold mb-6 animate-prize stagger-5">
          {CoinIcon && <CoinIcon />}
          <span>
            {wonPrize} {config.prizes.currency}
          </span>
        </div>

        <div className="animate-pop-in stagger-6">
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
