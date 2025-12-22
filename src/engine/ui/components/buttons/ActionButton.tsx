import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import type { ThemeColors } from '@engine/types';
import { BaseButton } from './BaseButton';

interface ActionButtonProps {
  children: ReactNode;
  theme: ThemeColors;
  disabled?: boolean;
  className?: string;
  onClick: () => void;
  onPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void;
}

export function ActionButton({
  children,
  theme,
  disabled,
  className = '',
  onClick,
  onPointerDown,
}: ActionButtonProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [fitScale, setFitScale] = useState(1);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const btn = buttonRef.current;
    if (!wrap || !btn) return;

    let rafId: number | null = null;
    let cancelled = false;

    const fit = () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;

        const available = wrap.clientWidth;
        const needed = btn.scrollWidth;
        if (available <= 0 || needed <= 0) return;

        const next = Math.min(1, (available - 1) / needed);
        const clamped = Math.max(0.6, next);
        setFitScale((prev) => (Math.abs(prev - clamped) < 0.002 ? prev : clamped));
      });
    };

    fit();

    const ro = new ResizeObserver(() => fit());
    ro.observe(wrap);

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
  }, [children]);

  return (
    <div ref={wrapRef} className="w-full flex justify-center overflow-visible">
      <div
        className="inline-block overflow-visible"
        style={{
          transform: `scale(${fitScale.toFixed(4)})`,
          transformOrigin: 'center',
        }}
      >
        <BaseButton
          ref={buttonRef}
          disabled={disabled}
          onClick={onClick}
          onPointerDown={onPointerDown}
          enablePointerCapture={true}
          glareRestart="pointer"
          className={`glare action-btn px-8 py-3 font-bold text-lg tracking-wide border-4 ${className}`}
          style={{
            ['--btn-glow' as string]: theme.glow,
            touchAction: 'manipulation',
            boxShadow: disabled
              ? 'none'
              : `0 5px 20px rgba(0, 0, 0, 0.3), 0 0 25px ${theme.glow}`,
            borderStyle: 'ridge',
            textShadow: disabled ? 'none' : '0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          {children}
        </BaseButton>
      </div>
    </div>
  );
}

export default ActionButton;
