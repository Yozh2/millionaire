import { useCallback, useEffect, useMemo, useState } from 'react';

import { VerticalSlider } from './VerticalSlider';
import { DEFAULT_PORTAL_HEADER_TUNER_VALUES } from './portalHeaderTunerDefaults';

export type PortalHeaderTunerValues = {
  translateY: number;
  scale: number;
  panelsOverlap: number;
};

export type PortalHeaderTunerProps = {
  storageKey: string;
  disabled?: boolean;
  onChange: (values: PortalHeaderTunerValues) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function readNumber(raw: string | null, fallback: number) {
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function PortalHeaderTuner({
  storageKey,
  disabled = false,
  onChange,
}: PortalHeaderTunerProps) {
  const enabledKey = useMemo(() => `${storageKey}:enabled`, [storageKey]);
  const valuesKey = useMemo(() => `${storageKey}:values`, [storageKey]);

  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem(enabledKey) === '1';
    } catch {
      return false;
    }
  });

  const [values, setValues] = useState<PortalHeaderTunerValues>(() => {
    try {
      const raw = localStorage.getItem(valuesKey);
      if (!raw) return DEFAULT_PORTAL_HEADER_TUNER_VALUES;
      const parsed = JSON.parse(raw) as Partial<Record<keyof PortalHeaderTunerValues, unknown>>;
      const translateYRaw =
        typeof parsed.translateY === 'number' ? parsed.translateY : DEFAULT_PORTAL_HEADER_TUNER_VALUES.translateY;
      const scaleRaw =
        typeof parsed.scale === 'number' ? parsed.scale : DEFAULT_PORTAL_HEADER_TUNER_VALUES.scale;
      const panelsOverlapRaw =
        typeof parsed.panelsOverlap === 'number' ? parsed.panelsOverlap : DEFAULT_PORTAL_HEADER_TUNER_VALUES.panelsOverlap;
      return {
        translateY: clamp(readNumber(String(translateYRaw), DEFAULT_PORTAL_HEADER_TUNER_VALUES.translateY), -120, 80),
        scale: clamp(readNumber(String(scaleRaw), DEFAULT_PORTAL_HEADER_TUNER_VALUES.scale), 0.8, 1.3),
        panelsOverlap: clamp(
          readNumber(String(panelsOverlapRaw), DEFAULT_PORTAL_HEADER_TUNER_VALUES.panelsOverlap),
          -220,
          220
        ),
      };
    } catch {
      return DEFAULT_PORTAL_HEADER_TUNER_VALUES;
    }
  });

  useEffect(() => {
    if (disabled) return;
    onChange(isOpen ? values : DEFAULT_PORTAL_HEADER_TUNER_VALUES);
  }, [disabled, isOpen, onChange, values]);

  useEffect(() => {
    try {
      localStorage.setItem(enabledKey, isOpen ? '1' : '0');
    } catch {
      // ignore storage errors
    }
  }, [enabledKey, isOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(valuesKey, JSON.stringify(values));
    } catch {
      // ignore storage errors
    }
  }, [valuesKey, values]);

  const update = useCallback(
    (patch: Partial<PortalHeaderTunerValues>) => {
      setValues((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const toggle = () => {
    if (disabled) return;
    setIsOpen((v) => !v);
  };

  const isDisabled = disabled;

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={toggle}
        className={`text-[10px] tracking-wide uppercase px-2 py-1 rounded border ${
          isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'
        } border-white/20 bg-black/35 text-white/80 backdrop-blur-[2px]`}
        title="Portal header tuner"
      >
        {isOpen ? 'Tuner: on' : 'Tuner: off'}
      </button>

      {isOpen && (
        <div className="flex items-start gap-2 pr-0.5">
          <VerticalSlider
            label="Y"
            min={-120}
            max={80}
            step={1}
            value={values.translateY}
            disabled={isDisabled}
            onChange={(v) => update({ translateY: v })}
          />
          <VerticalSlider
            label="S"
            min={0.8}
            max={1.3}
            step={0.01}
            value={values.scale}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            disabled={isDisabled}
            onChange={(v) => update({ scale: v })}
          />
          <VerticalSlider
            label="H"
            min={-220}
            max={220}
            step={2}
            value={values.panelsOverlap}
            disabled={isDisabled}
            onChange={(v) => update({ panelsOverlap: v })}
          />
        </div>
      )}
    </div>
  );
}

export default PortalHeaderTuner;
