import type { ComponentType } from 'react';
import type { GameConfig, LifelineResult, ThemeColors } from '../../types';
import { Panel, PanelHeader } from '../ui';

interface LifelineResultPanelProps {
  displayed: LifelineResult;
  exiting: boolean;
  config: GameConfig;
  theme: ThemeColors;
  PhoneLifelineIcon: ComponentType;
}

export function LifelineResultPanel({
  displayed,
  exiting,
  config,
  theme,
  PhoneLifelineIcon,
}: LifelineResultPanelProps) {
  if (!displayed) return null;

  const headerText =
    displayed.type === 'phone'
      ? (config.strings.lifelinePhoneHeader ?? config.strings.hintPhoneHeader)
      : (config.strings.lifelineAudienceHeader ??
        config.strings.hintAudienceHeader);

  const senderLabel =
    config.strings.lifelineSenderLabel ?? config.strings.hintSenderLabel;

  return (
    <Panel
      className={`p-1 mt-1 ${
        exiting ? 'animate-dust-out' : 'animate-slide-in stagger-4'
      }`}
    >
      <PanelHeader>{headerText}</PanelHeader>
      <div className="p-3">
        {displayed.type === 'phone' && (
          <div>
            <p className="text-amber-400 text-xs mb-1 italic">
              <PhoneLifelineIcon /> {senderLabel} {displayed.name}
            </p>
            <p className="text-amber-300 italic">{displayed.text}</p>
          </div>
        )}

        {displayed.type === 'audience' && (
          <div>
            <div className="grid grid-cols-4 gap-2">
              {displayed.percentages.map((p, i) => (
                <div key={i} className="text-center">
                  <div
                    className={`h-16 bg-black border-2 ${theme.border} relative overflow-hidden`}
                    style={{ borderStyle: 'inset' }}
                  >
                    <div
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${theme.bgLifeline} transition-all duration-500`}
                      style={{ height: `${p}%` }}
                    />
                  </div>
                  <span className={`text-xs ${theme.textPrimary}`}>
                    [{['A', 'B', 'C', 'D'][i]}] {p}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

export default LifelineResultPanel;

