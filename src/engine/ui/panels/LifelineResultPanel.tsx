import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import type { GameConfig, LifelineResult, ThemeColors } from '@engine/types';
import { Panel, PanelHeader } from '@engine/ui/components/panel';
import { LifelinePhonePanel } from './lifelines/LifelinePhonePanel';
import { LifelineAudiencePanel } from './lifelines/LifelineAudiencePanel';
import { LifelineHostPanel } from './lifelines/LifelineHostPanel';
import { LifelineSwitchPanel } from './lifelines/LifelineSwitchPanel';
import { LifelineDoublePanel } from './lifelines/LifelineDoublePanel';

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
    if (a.type === 'host' && b.type === 'host') {
      return (
        a.suggestedDisplayIndex === b.suggestedDisplayIndex &&
        a.answerText === b.answerText &&
        a.confidence === b.confidence
      );
    }
    if (a.type === 'switch' && b.type === 'switch') return true;
    if (a.type === 'double' && b.type === 'double') {
      return a.stage === b.stage;
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

  const headerText = (() => {
    if (displayed.type === 'phone') {
      return config.strings.lifelinePhoneHeader;
    }
    if (displayed.type === 'audience') {
      return config.strings.lifelineAudienceHeader;
    }
    if (displayed.type === 'host') {
      return config.lifelines.host?.name ?? 'Помощь ведущего';
    }
    if (displayed.type === 'switch') {
      return config.lifelines.switch?.name ?? 'Замена вопроса';
    }
    return config.lifelines.double?.name ?? 'Право на ошибку';
  })();

  const senderLabel = config.strings.lifelineSenderLabel;
  const audienceLabel = config.strings.lifelineAudienceLabel;
  const switchText = config.strings.lifelineSwitchText ?? 'Вопрос заменён. Продолжаем.';
  const doubleTextArmed =
    config.strings.lifelineDoubleArmedText ?? 'Можно ошибиться один раз — и выбрать ответ повторно.';
  const doubleTextUsed =
    config.strings.lifelineDoubleUsedText ?? 'Первый промах принят. Выбери ещё раз.';

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
            theme={theme}
            icon={PhoneLifelineIcon}
            senderLabel={senderLabel}
            name={displayed.name}
            text={displayed.text}
          />
        )}

        {displayed.type === 'audience' && (
          <LifelineAudiencePanel
            theme={theme}
            percentages={displayed.percentages}
            label={audienceLabel}
          />
        )}

        {displayed.type === 'host' && (
          <LifelineHostPanel
            theme={theme}
            icon={config.lifelines.host?.icon ?? '🎭'}
            result={displayed}
          />
        )}

        {displayed.type === 'switch' && (
          <LifelineSwitchPanel
            theme={theme}
            icon={config.lifelines.switch?.icon ?? '🔁'}
            result={displayed}
            text={switchText}
          />
        )}

        {displayed.type === 'double' && (
          <LifelineDoublePanel
            theme={theme}
            icon={config.lifelines.double?.icon ?? '🎯'}
            result={displayed}
            text={displayed.stage === 'armed' ? doubleTextArmed : doubleTextUsed}
          />
        )}
      </div>
    </Panel>
  );
}

export default LifelineResultPanel;
