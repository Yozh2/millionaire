import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEventHandler } from 'react';
import type { ButtonFsmState } from './types';

function hitTest(el: HTMLElement, clientX: number, clientY: number): boolean {
  const rect = el.getBoundingClientRect();
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

export interface UseButtonFsmOptions {
  disabled?: boolean;
  initial?: ButtonFsmState;
  enablePointerCapture?: boolean;
  easeMs?: number;
  activateMs?: number;
}

export interface UseButtonFsmResult {
  state: ButtonFsmState;
  isOver: boolean;
  eventHandlers: {
    onPointerEnter: PointerEventHandler<HTMLElement>;
    onPointerLeave: PointerEventHandler<HTMLElement>;
    onPointerDown: PointerEventHandler<HTMLElement>;
    onPointerMove: PointerEventHandler<HTMLElement>;
    onPointerUp: PointerEventHandler<HTMLElement>;
    onPointerCancel: PointerEventHandler<HTMLElement>;
    onLostPointerCapture: PointerEventHandler<HTMLElement>;
  };
  suppressNextClickRef: React.MutableRefObject<boolean>;
}

export function useButtonFsm({
  disabled = false,
  initial = 'Idle',
  enablePointerCapture = true,
  easeMs = 120,
  activateMs = 140,
}: UseButtonFsmOptions = {}): UseButtonFsmResult {
  const [state, setState] = useState<ButtonFsmState>(initial);
  const [isOver, setIsOver] = useState<boolean>(true);
  const pointerIdRef = useRef<number | null>(null);
  const easeTimerRef = useRef<number | null>(null);
  const activateTimerRef = useRef<number | null>(null);
  const suppressNextClickRef = useRef<boolean>(false);

  useEffect(() => {
    if (state !== 'Appear') return;
    const id = window.setTimeout(() => setState('Idle'), 0);
    return () => window.clearTimeout(id);
  }, [state]);

  useEffect(() => {
    return () => {
      if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
      if (activateTimerRef.current) window.clearTimeout(activateTimerRef.current);
    };
  }, []);

  const eventHandlers = useMemo(() => {
    const clearTimers = () => {
      if (easeTimerRef.current) window.clearTimeout(easeTimerRef.current);
      if (activateTimerRef.current) window.clearTimeout(activateTimerRef.current);
      easeTimerRef.current = null;
      activateTimerRef.current = null;
    };

    const scheduleEaseDone = () => {
      clearTimers();
      easeTimerRef.current = window.setTimeout(() => {
        setState((prev) => {
          if (prev !== 'Ease') return prev;
          return isOver ? 'Hover' : 'Idle';
        });
      }, easeMs);
    };

    const scheduleActivateDone = () => {
      clearTimers();
      activateTimerRef.current = window.setTimeout(() => {
        setState((prev) => {
          if (prev !== 'Activate') return prev;
          return isOver ? 'Hover' : 'Idle';
        });
      }, activateMs);
    };

    const onPointerEnter: PointerEventHandler<HTMLElement> = () => {
      if (disabled) return;
      setIsOver(true);
      setState((prev) => {
        if (prev === 'Idle') return 'Hover';
        return prev;
      });
    };

    const onPointerLeave: PointerEventHandler<HTMLElement> = () => {
      if (disabled) return;
      setIsOver(false);
      setState((prev) => {
        if (prev === 'Hover') return 'Idle';
        return prev;
      });
    };

    const onPointerDown: PointerEventHandler<HTMLElement> = (e) => {
      if (disabled) return;
      if (e.button !== 0) return;

      clearTimers();
      pointerIdRef.current = e.pointerId;
      setIsOver(true);
      setState('Press');

      if (enablePointerCapture) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    };

    const onPointerMove: PointerEventHandler<HTMLElement> = (e) => {
      if (disabled) return;
      if (state !== 'Press') return;
      setIsOver(hitTest(e.currentTarget, e.clientX, e.clientY));
    };

    const onPointerUp: PointerEventHandler<HTMLElement> = (e) => {
      if (disabled) return;
      if (pointerIdRef.current !== e.pointerId) return;

      if (enablePointerCapture) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }

      const over = hitTest(e.currentTarget, e.clientX, e.clientY);
      setIsOver(over);
      suppressNextClickRef.current = !over;
      pointerIdRef.current = null;

      if (over) {
        setState('Activate');
        scheduleActivateDone();
      } else {
        setState('Ease');
        scheduleEaseDone();
      }
    };

    const onPointerCancel: PointerEventHandler<HTMLElement> = (e) => {
      if (disabled) return;
      if (pointerIdRef.current !== e.pointerId) return;
      suppressNextClickRef.current = true;
      pointerIdRef.current = null;
      setIsOver(false);
      setState('Ease');
      scheduleEaseDone();
    };

    const onLostPointerCapture: PointerEventHandler<HTMLElement> = () => {
      if (disabled) return;
      suppressNextClickRef.current = true;
      pointerIdRef.current = null;
      setIsOver(false);
      setState('Ease');
      scheduleEaseDone();
    };

    return {
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
    };
  }, [activateMs, disabled, easeMs, enablePointerCapture, isOver, state]);

  return {
    state,
    isOver,
    eventHandlers,
    suppressNextClickRef,
  };
}
