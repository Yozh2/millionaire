import { useId } from 'react';

export type VerticalSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
};

export function VerticalSlider({
  label,
  value,
  min,
  max,
  step = 1,
  disabled = false,
  formatValue,
  onChange,
}: VerticalSliderProps) {
  const id = useId();
  const displayValue = formatValue ? formatValue(value) : String(Math.round(value));

  return (
    <div className="flex flex-col items-center gap-1">
      <label
        htmlFor={id}
        className={`text-[10px] tracking-wide uppercase select-none ${
          disabled ? 'text-white/25' : 'text-white/70'
        }`}
      >
        {label}
      </label>

      <div className="relative h-32 w-8 flex items-center justify-center">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-32 w-8 appearance-none bg-transparent cursor-pointer"
          style={{
            writingMode: 'bt-lr',
            WebkitAppearance: 'slider-vertical',
            accentColor: disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.85)',
          }}
        />
      </div>

      <div
        className={`text-[10px] tabular-nums ${
          disabled ? 'text-white/25' : 'text-white/70'
        }`}
      >
        {displayValue}
      </div>
    </div>
  );
}

export default VerticalSlider;
