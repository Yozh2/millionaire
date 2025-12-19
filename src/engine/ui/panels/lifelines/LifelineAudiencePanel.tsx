import type { ThemeColors } from '@engine/types';

interface LifelineAudiencePanelProps {
  theme: ThemeColors;
  percentages: number[];
  label?: string;
}

export function LifelineAudiencePanel({
  theme,
  percentages,
  label,
}: LifelineAudiencePanelProps) {
  return (
    <div>
      {label && <p className={`text-xs mb-2 ${theme.textAccent}`}>{label}</p>}
      <div className="grid grid-cols-4 gap-2">
        {percentages.map((p, i) => (
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
            <span className={`text-xs ${theme.textAccent}`}>
              [{['A', 'B', 'C', 'D'][i]}] {p}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LifelineAudiencePanel;
