import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import type { GameConfig, LifelineResult, ThemeColors } from '../../types';
import { Panel, PanelHeader } from '../../ui/components/panel';
import { LifelinePhonePanel } from './lifelines/LifelinePhonePanel';
import { LifelineAudiencePanel } from './lifelines/LifelineAudiencePanel';

interface LifelineResultPanelProps {
  lifelineResult: LifelineResult;
  config: GameConfig;
  theme: ThemeColors;
  PhoneLifelineIcon: ComponentType;
}

export function LifelineResultPanel({
  lifelineResult,
  config,
  theme,
  PhoneLifelineIcon,
}: LifelineResultPanelProps) {
  const EXIT_MS = 140;
  const [displayed, setDisplayed] = useState<LifelineResult>(lifelineResult);
  const [exiting, setExiting] = useState(false);

  const resultsEqual = (a: LifelineResult, b: LifelineResult) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.type !== b.type) return false;
    if (a.type === 'phone' && b.type === 'phone') {
      return a.name === b.name && a.text === b.text;
    }
    if (a.type === 'audience' && b.type === 'audience') {
      return (
        a.percentages.length === b.percentages.length &&
        a.percentages.every((value, idx) => value === b.percentages[idx])
      );
    }
    return false;
  };

  useEffect(() => {
    if (resultsEqual(lifelineResult, displayed)) {
      setExiting(false);
      return;
    }

    if (!displayed) {
      if (lifelineResult) {
        setDisplayed(lifelineResult);
      }
      setExiting(false);
      return;
    }

    setExiting(true);
    const timeout = setTimeout(() => {
      setDisplayed(lifelineResult);
      setExiting(false);
    }, EXIT_MS);

    return () => clearTimeout(timeout);
  }, [lifelineResult, displayed]);

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
          <LifelinePhonePanel
            icon={PhoneLifelineIcon}
            senderLabel={senderLabel}
            name={displayed.name}
            text={displayed.text}
          />
        )}

        {displayed.type === 'audience' && (
          <LifelineAudiencePanel theme={theme} percentages={displayed.percentages} />
        )}
      </div>
    </Panel>
  );
}

export default LifelineResultPanel;
